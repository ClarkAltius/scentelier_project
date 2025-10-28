package com.scentelier.backend.service;

import com.scentelier.backend.dto.IngredientStockDto;
import com.scentelier.backend.entity.Ingredient;
import com.scentelier.backend.repository.IngredientRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientService {
    private final IngredientRepository ingredientRepository;

    public void save(Ingredient ingredient) {
        ingredientRepository.save(ingredient);
    }

    // 상품 재고 가져오기 서비스
    public List<IngredientStockDto> getIngredientStock() {
        return ingredientRepository.findAll().stream()
                .map(ingredient -> new IngredientStockDto(ingredient.getId(), ingredient.getName(), ingredient.getStock()))
                .collect(Collectors.toList());

    }

    public List<Ingredient> findAll() {
        List<Ingredient> ingredients = ingredientRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
        System.out.println("향료 리스트 " + ingredients);
        return ingredientRepository.findAll();
    }

    @Transactional
    public IngredientStockDto updateStock(Long itemId, @NotNull(message = "Stock value cannot be null.") Integer newStock) {

        Ingredient ingredient = ingredientRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Ingredient not found with id: " + itemId));

        int currentStock = ingredient.getStock();
        ingredient.setStock(newStock + currentStock);
        Ingredient updatedIngredient = ingredientRepository.save(ingredient);

        return new IngredientStockDto(updatedIngredient.getId(), updatedIngredient.getName(), updatedIngredient.getStock());
    }
}
