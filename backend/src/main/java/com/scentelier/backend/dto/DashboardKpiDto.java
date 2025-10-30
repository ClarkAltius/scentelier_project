package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKpiDto {
    private long totalRevenue;
    private int totalOrders;
    private int newCustomers;
}