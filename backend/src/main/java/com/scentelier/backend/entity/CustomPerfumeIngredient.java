package com.scentelier.backend.entity;

import com.scentelier.backend.constant.Note;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter @Setter @ToString
@Entity @Table(name = "custom_perfume_ingredient")
public class CustomPerfumeIngredient {
    @ManyToOne
    @JoinColumn(name = "custom_id", nullable = false)
    private CustomPerfume customPerfume;

    @ManyToOne
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredients;

    @Enumerated(EnumType.STRING)
    @Column(name = "note_type", nullable = false)
    private Note noteType;

    private BigDecimal amount;

    @Column(name = "img_url")
    private String imgUrl;
}
