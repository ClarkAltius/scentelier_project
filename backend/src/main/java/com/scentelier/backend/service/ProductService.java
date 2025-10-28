package com.scentelier.backend.service;

import com.scentelier.backend.entity.Products;
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
    @Autowired
    private ProductRepository productRepository;

    public void save(Products products) {
        this.productRepository.save(products);
    }

    public Optional<Products> findProductsById(Long productId) {
        return productRepository.findById(productId);
    }

    //상품 리스트 pageable로 전체 가져오기 서비스
    public Page<Products> findAll(Pageable pageable) {
        return productRepository.findAllByIsDeletedFalse(pageable); //삭제 x 인 상품만
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
        return new ProductStockDto(updateProduct.getId(), updateProduct.getName(), updateProduct.getStock());

    }
}


