package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// 주문 상품 정보
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewOrderProductDto {
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal price;
}
