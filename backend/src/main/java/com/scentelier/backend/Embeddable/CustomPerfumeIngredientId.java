package com.scentelier.backend.Embeddable;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CustomPerfumeIngredientId implements Serializable {
    private Long customId;
    private Long ingredientId;

    // 기본 생성자, equals(), hashCode() 필수
    public CustomPerfumeIngredientId() {}
    public CustomPerfumeIngredientId(Long customId, Long ingredientId) {
        this.customId = customId;
        this.ingredientId = ingredientId;
    }

    public Long getCustomId() {
        return customId;
    }

    public void setCustomId(Long customId) {
        this.customId = customId;
    }

    public Long getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Long ingredientId) {
        this.ingredientId = ingredientId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        CustomPerfumeIngredientId that = (CustomPerfumeIngredientId) o;
        return Objects.equals(customId, that.customId) && Objects.equals(ingredientId, that.ingredientId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(customId, ingredientId);
    }
}
