package com.scentelier.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class POItemDto {
    private String name;
    private int quantity;
    private BigDecimal unitPrice;
}