package com.scentelier.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductPerformanceDto {
    private Long id;
    private String name;
    private String category;
    private String season;
    private Long unitsSold;
    private Long revenue;
    private Double avgRating;
    private Double rePurchaseRate;
}