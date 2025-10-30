package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySalesDto {
    private String month; // e.g., "2025-10", "2025-09"
    private long sales;   // Total sales for that month
}