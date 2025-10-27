package com.scentelier.backend.service;

import com.scentelier.backend.entity.Products;
import com.scentelier.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.scentelier.backend.dto.ProductStockDto;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
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


    public boolean deleteProduct(Long id) {
        if(productRepository.existsById(id)){
            this.productRepository.deleteById(id);  // 상품 실제 삭제 요청. 실제 상품 삭제가 아닌 소프트 딜리트 필요
            return true;
        }else{
            return false;
        }
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
}


