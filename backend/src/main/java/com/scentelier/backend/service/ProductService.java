package com.scentelier.backend.service;

import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.repository.CartItemRepository;
import com.scentelier.backend.repository.OrderRepository;
import com.scentelier.backend.repository.ProductRepository;
import com.scentelier.backend.repository.ReviewRepository;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.scentelier.backend.dto.ProductStockDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.NoSuchElementException;
import jakarta.transaction.Transactional;

// 주문 취소 리스너용
import com.scentelier.backend.event.OrderCancelledEvent;
import com.scentelier.backend.entity.OrderProduct;
import org.springframework.context.event.EventListener;

@Service
public class ProductService {

    private static final List<OrderStatus> BLOCK_STATUSES = List.of(
            OrderStatus.CREATED, OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.PAYMENT_PENDING
    );
    private static final List<OrderStatus> PENDING_STATUSES = List.of(
            OrderStatus.CREATED,
            OrderStatus.PENDING,
            OrderStatus.PROCESSING,
            OrderStatus.PAYMENT_PENDING,
            OrderStatus.PAID,        // 결제 완료도 아직 배송 전이면 진행 중으로 볼 거면 유지
            OrderStatus.SHIPPED    // 배송 중도 진행 중으로 표시
    );

    @Autowired
    private ProductRepository productRepository;
    private CartItemRepository cartItemRepository;
    private OrderRepository orderRepository;
    private ReviewRepository reviewRepository;

    public ProductService(
            ProductRepository productRepository,
            CartItemRepository cartItemRepository,
            OrderRepository orderRepository,
            ReviewRepository reviewRepository
    ) {
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
    }

    public void save(Products products) {
        this.productRepository.save(products);
    }

    public Optional<Products> findProductsById(Long productId) {
        return productRepository.findById(productId);
    }

    //상품 리스트 pageable로 전체 가져오기 서비스
    public Page<Products> findAll(Pageable pageable) {
        return productRepository.findAll(pageable); //삭제 x 인 상품만
    }
    public List<Products> findAll() {
        return productRepository.findAllByIsDeletedFalseAndStockGreaterThan(0);
    }

    public Products ProductById(Long id) {
        Optional<Products> product = this.productRepository.findById(id);
        return product.orElse(null);
    }


    // 관리자창 상품 재고 가져오기 서비스
    public Page<ProductStockDto> getProductStock(String search, Pageable pageable) {
        Page<Products> productPage;

        if (search != null && !search.isBlank()) {
            String searchPattern = "%" + search.toLowerCase() + "%";
            productPage = productRepository.findAllByIsDeletedFalseAndSearch(searchPattern, pageable);
                   } else {
            productPage = productRepository.findAllByIsDeleted(false, pageable);
                   }

        return productPage.map(product -> new ProductStockDto(
           product.getId(),
           product.getName(),
           product.getStock(),
           product.getImageUrl()
        ));
    }


    @Transactional
    public boolean softDelete(Long id) {
        Optional<Products> opt = productRepository.findById(id); // 삭제여부 무관하게 찾아야 하면 findAnyById 사용 가능
        if (opt.isEmpty()) return false;
        Products p = opt.get();
        if (!p.isDeleted()) {
            p.setDeleted(true);
            p.setDeletedAt(LocalDate.now());
        }
        return true;
    }


    @EventListener
    @Transactional
    public void handleOrderCancellation(OrderCancelledEvent event) {
        System.out.println("주문 취소 heard: " + event.getCancelledOrder().getId());

        // 취소된 주문에서 모든 제품 찾기
        for (OrderProduct item : event.getCancelledOrder().getOrderProducts()) {

            // 제품 찾기
            Products product = item.getProducts();
            if (product != null) {
                // 구 수량, 취소 수량 판별
                int currentStock = product.getStock();
                int restockAmount = item.getQuantity();

                // 구 수량, 취소 수량 합산
                product.setStock(currentStock + restockAmount);

                // 새로운 수량 저장
                productRepository.save(product);
                System.out.println("Restocked " + restockAmount + " of product " + product.getName());
            }
        }
    }


    @Transactional
    public ProductStockDto updateStock(Long itemId, @NotNull(message = "Stock value cannot be null.") Integer newStock) {

        // 데이터베이스에서 제품 탐색
        Products product = productRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("제품이 없습니다: " + itemId));
        // 제품 수량 설정
        int currentStock = product.getStock();
        product.setStock(newStock + currentStock);

        // 제품 수량 저장
        Products updateProduct = productRepository.save(product);

        // DTO 반환
        return new ProductStockDto(updateProduct.getId(), updateProduct.getName(), updateProduct.getStock(), updateProduct.getImageUrl());
    }

    public Page<Products> findAllSelling(Pageable pageable) {
        return productRepository.findAllByIsDeleted(false, pageable);
    }
    // 관리자 목록: 모두
    public Page<Products> findAllAdmin(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    // --- 상태 계산 (노출용) ---
    public String computeStatus(Products p) {
        if (p.isDeleted()) return "STOPPED";
        long inCarts  = cartItemRepository.countActiveByProductId(p.getId());
        long inOrders = orderRepository.countPendingOrdersByProductId(p.getId(), BLOCK_STATUSES);
        return (inCarts > 0 || inOrders > 0) ? "PENDING" : "SELLING";
    }

    // --- 판매재개(복구) ---
    @Transactional
    public Products restoreDeleted(Long id) {
        Products p = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("상품 없음: " + id));
        p.setDeleted(false);
        p.setDeletedAt(null);
        return productRepository.save(p);
    }

    // --- 관리자 토글 (STOPPED<->SELLING) ---
    @Transactional
    public Products updateSellingFlag(Long id, boolean stop) {
        Products p = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("상품 없음: " + id));
        if (stop) {
            // SELLING -> STOPPED: 장바구니/진행주문 있으면 차단
//            long cartCnt  = cartItemRepository.countActiveByProductId(id);
//            long orderCnt = orderRepository.countPendingOrdersByProductId(id, BLOCK_STATUSES);
//            if (cartCnt > 0 || orderCnt > 0) {
//                StringBuilder sb = new StringBuilder("판매중지 불가: ");
//                boolean first = true;
//                if (cartCnt > 0)   { sb.append("장바구니 ").append(cartCnt).append("건"); first = false; }
//                if (orderCnt > 0)  { if (!first) sb.append(", "); sb.append("진행 중 주문 ").append(orderCnt).append("건"); }
//                sb.append("이 존재합니다.");
//                throw new IllegalStateException(sb.toString()); // 컨트롤러에서 409로 응답
//            }
            p.setDeleted(true);
            p.setDeletedAt(LocalDate.now());
        } else {
            // STOPPED -> SELLING
            p.setDeleted(false);
            p.setDeletedAt(null);
        }
        return productRepository.save(p);
    }
    @Transactional
    public Products update(Long id, Products payload) {
        Products p = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다. id=" + id));

        if (payload.getName() != null)        p.setName(payload.getName());
        if (payload.getDescription() != null) p.setDescription(payload.getDescription());
        if (payload.getPrice() != null)       p.setPrice(payload.getPrice());
        if (payload.getImageUrl() != null)    p.setImageUrl(payload.getImageUrl());
        if (payload.getCategory() != null)    p.setCategory(payload.getCategory());
        if (payload.getSeason() != null)      p.setSeason(payload.getSeason());
        if (payload.getKeyword() != null) {
            String kw = payload.getKeyword().trim();
            p.setKeyword(kw.isEmpty() ? null : kw);
        }

        // ★ stock은 primitive int라 null 체크 불가 → 항상 대입
        p.setStock(payload.getStock());

        return productRepository.save(p);
    }

    // 평균 별점 상위 5개
    public List<Map<String, Object>> getTopRatedProducts() {
        Pageable limit = PageRequest.of(0, 5);
        List<Object[]> results = reviewRepository.findTopRatedProducts(limit);

        return results.stream().map(obj -> {
            Long productId = (Long) obj[0];
            Double avgRating = (Double) obj[1];
            Long reviewCount = (Long) obj[2];

            Products product = productRepository.findById(productId).orElse(null);
            if (product == null) return null;

            Map<String, Object> map = new HashMap<>();
            map.put("id", product.getId());
            map.put("name", product.getName());
            map.put("price", product.getPrice());
            map.put("imageUrl", product.getImageUrl());
            map.put("keyword", product.getKeyword());
            map.put("avgRating", Math.round(avgRating * 10) / 10.0);
            map.put("reviewCount", reviewCount);
            return map;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }
    public Page<Products> findAdminProducts(Pageable pageable, String q, boolean includeDeleted) {
        boolean hasQ = q != null && !q.isBlank();
        String search = hasQ ? "%" + q.toLowerCase() + "%" : null;

        if (includeDeleted) {
            if (hasQ) {
                return productRepository.findAllBySearch(search, pageable);
            }
            return productRepository.findAll(pageable);
        } else {
            if (hasQ) {
                return productRepository.findAllByIsDeletedFalseAndRichSearch(search, pageable);
            }
            return productRepository.findAllByIsDeleted(false, pageable);
        }
    }
}