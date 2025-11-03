package com.scentelier.backend.dto;

import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.CustomPerfumeIngredient;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class CustomPerfumeDTO {
    private Long customId;
    private String perfumeName;
    private int volume;
    private LocalDate createdDate;

    public CustomPerfumeDTO(CustomPerfume cp) {
        this.customId = cp.getId();
        this.perfumeName = cp.getName();
        this.volume = cp.getVolume();
        this.createdDate = cp.getCreatedAt();

        // CustomPerfumeIngredient 정보를 풀어서 DTO로 변환
        this.ingredients = cp.getCustomPerfumeIngredients().stream()
                .map(IngredientInfo::new)
                .collect(Collectors.toList());
    }

    private List<IngredientInfo> ingredients;

    @Getter
    @Setter
    public static class IngredientInfo {
        private String ingredientName;
        private String noteType;
        private BigDecimal amount;

        public IngredientInfo(CustomPerfumeIngredient cpi) {
            this.ingredientName = cpi.getIngredients().getName();
            this.noteType = cpi.getNoteType().name(); // enum이면 name()
            this.amount = cpi.getAmount();
        }
    }
}


