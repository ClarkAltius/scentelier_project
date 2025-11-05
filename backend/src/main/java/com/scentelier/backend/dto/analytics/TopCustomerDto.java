package com.scentelier.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopCustomerDto {
    private Long id;
    private String email;
    private long totalOrders;
    private long totalSpent;
}