package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// 리뷰 작성 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCreateDto {
    private Long orderId;
    private String content;
    private int rating;
}