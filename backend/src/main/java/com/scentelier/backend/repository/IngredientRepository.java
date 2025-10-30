package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    
    // 현 재고가 특정 수량 이하인 재고 리스트로 반환
    List<Ingredient> findByStockLessThan(int stock, Pageable pageable);

}
