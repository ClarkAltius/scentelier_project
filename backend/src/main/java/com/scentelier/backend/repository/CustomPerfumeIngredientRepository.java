package com.scentelier.backend.repository;

import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.CustomPerfumeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomPerfumeIngredientRepository extends JpaRepository<CustomPerfumeIngredient, Long> {
    List<CustomPerfumeIngredient> findByCustomPerfume(CustomPerfume customPerfume);
}
