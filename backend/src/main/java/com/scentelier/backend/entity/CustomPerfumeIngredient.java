package com.scentelier.backend.entity;

import com.scentelier.backend.Embeddable.CustomPerfumeIngredientId;
import com.scentelier.backend.constant.Note;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter @Setter @ToString
@Entity @Table(name = "custom_perfume_ingredient")
public class CustomPerfumeIngredient {

    @EmbeddedId
    private CustomPerfumeIngredientId id = new CustomPerfumeIngredientId(); // ✅ null 방지용

    @ManyToOne
    @MapsId("customId")
    @JoinColumn(name = "custom_id", nullable = false)
    private CustomPerfume customPerfume;

    @NotNull(message = "향료를 선택해주세요.")
    @ManyToOne
    @MapsId("ingredientId")
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredients;

    @Enumerated(EnumType.STRING)
    @Column(name = "note_type", nullable = false)
    private Note noteType;

    @NotNull(message = "비율을 선택해주세요.")
    private BigDecimal amount;

}
