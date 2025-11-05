package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MostUsedIngredientDto {
    private Integer id; // Ingredient ID
    private String name;
    private BigDecimal usage; // "units used"

    public MostUsedIngredientDto(long l, String name, long l1) {
    }
}