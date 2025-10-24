package com.scentelier.backend.service;

import com.scentelier.backend.Embeddable.CustomPerfumeIngredientId;
import com.scentelier.backend.entity.Ingredient;
import com.scentelier.backend.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IngredientService {
    private final IngredientRepository ingredientRepository;
    private final Ingredient ingredient;

    public void save(Ingredient ingredient) {
        ingredientRepository.save(ingredient);
    }

    // 상품 재고 가져오기 서비스
    public List<IngredientStockDto> getIngredientStock() {
        return ingredientRepository.findAll().stream()
                .map(ingredient -> new IngredientStockDto(ingredient.getId(), ingredient.getName(), ingredient.getStock()))
                .collect(Collectors.toList());

    }
}
