package com.scentelier.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesDto {
    private String date; // Using String for 'yyyy-MM-dd' format
    private BigDecimal sales;

    public DailySalesDto(String date, Double sales) {
        this.date = date;
        if (sales != null) {
            this.sales = BigDecimal.valueOf(sales);
        } else {
            this.sales = BigDecimal.ZERO;
        }
    }
}