package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Ingredient;
import com.scentelier.backend.entity.Products;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    
    // 현 재고가 특정 수량 이하인 재고 리스트로 반환
    List<Ingredient> findByStockLessThan(int stock, Pageable pageable);

    Page<Ingredient> findAllByIsDeleted(boolean b, Pageable pageable);

    @Query("SELECT i FROM Ingredient i WHERE i.isDeleted = false AND" +
            "(LOWER(i.name) LIKE :search " +
            "OR str(i.id) LIKE :search)")
    Page<Ingredient> findAllByIsDeletedFalseAndSearch(@Param("search") String searchPattern, Pageable pageable);
}
