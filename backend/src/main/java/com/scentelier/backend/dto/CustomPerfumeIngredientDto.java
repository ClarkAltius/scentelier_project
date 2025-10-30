package com.scentelier.backend.dto;

import com.scentelier.backend.entity.CustomPerfumeIngredient;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CustomPerfumeIngredientDto {
    private String ingredientName;
    private BigDecimal amount;

    // 엔티티 매핑용 생성자
    public CustomPerfumeIngredientDto(CustomPerfumeIngredient ingredient) {
        if (ingredient.getIngredients() != null) {
            this.ingredientName = ingredient.getIngredients().getName();
        } else {
            this.ingredientName = "Unknown Ingredient";
        }
        this.amount = ingredient.getAmount();
    }
}