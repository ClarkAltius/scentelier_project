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

    public void save(Ingredient ingredient) {
        ingredientRepository.save(ingredient);
    }
}
