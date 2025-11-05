package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductStockDto {
        private Long id;
        private String name;
        private int stock;
        private String imageUrl;

    public ProductStockDto(Long id, String name, int stock) {
        this.id = id;
        this.name = name;
        this.stock = stock;
    }
}


