package com.scentelier.backend.service;

import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.constant.ProductStatus;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.repository.CartItemRepository;
import com.scentelier.backend.repository.OrderRepository;
import com.scentelier.backend.repository.ProductRepository;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.scentelier.backend.dto.ProductStockDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.NoSuchElementException;
import jakarta.transaction.Transactional;

// 주문 취소 리스너용
import com.scentelier.backend.event.OrderCancelledEvent;
import com.scentelier.backend.entity.OrderProduct;
import org.springframework.context.event.EventListener;

@Service
public class ProductService {

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

    public ProductService(
            ProductRepository productRepository,
            CartItemRepository cartItemRepository,
            OrderRepository orderRepository
    ) {
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
    }

    public void save(Products products) {
        this.productRepository.save(products);
    }

    public Optional<Products> findProductsById(Long productId) {
        return productRepository.findById(productId);
    }

    //상품 리스트 pageable로 전체 가져오기 서비스
    public List<Products> findAll() {
        return productRepository.findAllByIsDeletedFalse(); // 삭제되지 않은 상품 전체
    }

    public Products ProductById(Long id) {
        Optional<Products> product = this.productRepository.findById(id);
        return product.orElse(null);
    }

    // 상품 재고 가져오기 서비스
    public List<ProductStockDto> getProductStock() {
        return productRepository.findAll().stream()
                .map(product -> new ProductStockDto(product.getId(), product.getName(), product.getStock()))
                .collect(Collectors.toList());
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

//    @Transactional
//    public boolean toggleStatus(Long id) {
//        Products p = productRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("상품 없음"));
//
//        if (p.getStatus() == ProductStatus.SELLING) {
//            // STOPPED로 내리기 전 “장바구니/주문” 점검
//            long inCarts = cartItemRepository.countActiveByProductId(id);
//            long inPendingOrders = orderRepository.countPendingOrdersByProductId(id, PENDING_STATUSES);
//
//            if (inCarts > 0 || inPendingOrders > 0) {
//                StringBuilder sb = new StringBuilder("판매중지 불가: ");
//                boolean first = true;
//                if (inCarts > 0) { sb.append("장바구니 ").append(inCarts).append("건"); first = false; }
//                if (inPendingOrders > 0) { if (!first) sb.append(", "); sb.append("진행 중 주문 ").append(inPendingOrders).append("건"); }
//                sb.append("이 존재합니다.");
//                // 커스텀 예외 굳이 안 쓰고 RuntimeException으로 409 응답 유도
//                throw new RuntimeException(sb.toString());
//            }
//            p.setStatus(ProductStatus.STOPPED);
//        } else {
//            // STOPPED → SELLING은 제한 없이 허용
//            p.setStatus(ProductStatus.SELLING);
//        }
//
//        productRepository.save(p);
//        return true;
//    }

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
//    @Transactional
//    public Products updateStatus(Long id, ProductStatus status) {
//        if (status == null) {
//            throw new IllegalArgumentException("status 값이 비어 있습니다.");
//        }
//        Products p = productRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("상품 없음: " + id));
//
//        // 상태가 동일하면 아무 것도 안 함
//        if (p.getStatus() == status) {
//            return p;
//        }

        // SELLING → STOPPED 로 내릴 때만 차단 조건 검사
//        if (status == ProductStatus.STOPPED && p.getStatus() == ProductStatus.SELLING) {
//            long inCarts = cartItemRepository.countActiveByProductId(id);          // 장바구니 담긴 건수
//            long inPending = orderRepository.countPendingOrdersByProductId(id);    // 진행 중 주문 건수
//
//            if (inCarts > 0 || inPending > 0) {
//                StringBuilder sb = new StringBuilder("판매중지 불가: ");
//                boolean first = true;
//                if (inCarts > 0) { sb.append("장바구니 ").append(inCarts).append("건"); first = false; }
//                if (inPending > 0) { if (!first) sb.append(", "); sb.append("진행 중 주문 ").append(inPending).append("건"); }
//                sb.append("이 존재합니다.");
//                throw new RuntimeException(sb.toString());   // 커스텀 예외 안 쓰는 최소 변경 버전
//            }
//        }

        // 검사 통과했거나, STOPPED → SELLING/기타 변경은 바로 반영
//        p.setStatus(status);
//        return productRepository.save(p);
//    }
    
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
        return new ProductStockDto(updateProduct.getId(), updateProduct.getName(), updateProduct.getStock());
    }
}


