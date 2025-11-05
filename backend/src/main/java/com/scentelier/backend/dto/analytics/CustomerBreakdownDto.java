package com.scentelier.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerBreakdownDto {
    private String date;
    private long newCustomers;
    private long returningCustomers;
}