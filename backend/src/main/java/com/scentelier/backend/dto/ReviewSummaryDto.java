package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummaryDto {
    private Double averageRating;
    private Long reviewCount;
    private Page<ReviewDto> reviews;
}
