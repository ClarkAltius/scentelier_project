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
    private long unitsSold;
    private long revenue;
    private double avgRating;
    private double rePurchaseRate; // As discussed, value from 0.0 to 1.0
}