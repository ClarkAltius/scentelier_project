package com.scentelier.backend.service;

import com.scentelier.backend.dto.IngredientStockDto;
import com.scentelier.backend.entity.Ingredient;
import com.scentelier.backend.repository.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IngredientService {

    @Autowired
    private IngredientRepository ingredientRepository;
    private Ingredient ingredient;

    // 상품 재고 가져오기 서비스
    public List<IngredientStockDto> getIngredientStock() {
        return ingredientRepository.findAll().stream()
                .map(ingredient -> new IngredientStockDto(ingredient.getId(), ingredient.getName(), ingredient.getStock()))
                .collect(Collectors.toList());

    }
}