package com.scentelier.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class PurchaseOrderRequestDto {
    // Data from frontend
    private String poNumber;
    private String orderDate;
    private String dueDate;
    private String payDate;
    private String supplierName;
    private String remarks;

    // List of items
    private List<POItemDto> items;
}