package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LowStockItemDto {
    private Integer id;
    private String name;
    private int stock;
    private String type; // "Product" or "Ingredient"
}