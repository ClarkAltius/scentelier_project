package com.scentelier.backend.dto;

import com.scentelier.backend.constant.Note;
import com.scentelier.backend.entity.Ingredient;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CustomPerfumeInfoDto {

    @NotBlank(message = "향료를 선택해주세요.")
    private Long ingredientId;

    @Enumerated(EnumType.STRING)
    private Note noteType;

    @NotNull(message = "비율을 선택해주세요.")
    private BigDecimal amount;

}
