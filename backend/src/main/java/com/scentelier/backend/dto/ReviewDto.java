package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// 리뷰 조회 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private Long reviewId;
    private Long orderId;
    private String userName;
    private String content;
    private int rating;
    private LocalDateTime createdAt;

    // 주문 정보
    private String recipientName;
    private String address;
    private BigDecimal totalPrice;
    private String trackingNumber;
    private String paymentMethod;

    private List<ReviewOrderProductDto> products;
}
