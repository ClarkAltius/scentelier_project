package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IngredientStockDto {
    private Long id;
    private String name;
    private int stock;
}
