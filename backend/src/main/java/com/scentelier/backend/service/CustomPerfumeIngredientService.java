package com.scentelier.backend.service;

import com.scentelier.backend.Embeddable.CustomPerfumeIngredientId;
import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.CustomPerfumeIngredient;
import com.scentelier.backend.entity.Ingredient;
import com.scentelier.backend.repository.CustomPerfumeIngredientRepository;
import com.scentelier.backend.repository.IngredientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomPerfumeIngredientService {
    private final CustomPerfumeIngredientRepository customPerfumeIngredientRepository;
    private final IngredientRepository ingredientRepository;

    public List<CustomPerfumeIngredient> findByCustomPerfume(CustomPerfume customPerfume) {
        return customPerfumeIngredientRepository.findByCustomPerfume(customPerfume);
    }

    /**
     * 주문 시 Ingredient 재고를 (사용량 × 주문 수량) 만큼 차감
     */
    @Transactional
    public void reduceIngredientStock(CustomPerfume customPerfume, int quantity) {
        List<CustomPerfumeIngredient> ingredients = findByCustomPerfume(customPerfume);

        for (CustomPerfumeIngredient cpi : ingredients) {
            Ingredient ingredient = cpi.getIngredients();
            int usedAmount = cpi.getAmount().intValue() * quantity;

            if (ingredient.getStock() < usedAmount) {
                throw new RuntimeException("재료 재고가 부족합니다: " + ingredient.getName());
            }

            ingredient.setStock(ingredient.getStock()-usedAmount);
            ingredientRepository.save(ingredient);
        }
    }

    /**
     * 주문 취소 시 Ingredient 재고를 (사용량 × 주문 수량) 만큼 증가
     */
    @Transactional
    public void increaseIngredientStock(CustomPerfume customPerfume, int quantity) {
        List<CustomPerfumeIngredient> ingredients = findByCustomPerfume(customPerfume);

        for (CustomPerfumeIngredient cpi : ingredients) {
            Ingredient ingredient = cpi.getIngredients();
            int usedAmount = cpi.getAmount().intValue() * quantity;

            ingredient.setStock(ingredient.getStock()+usedAmount);
            ingredientRepository.save(ingredient);
        }
    }
}
