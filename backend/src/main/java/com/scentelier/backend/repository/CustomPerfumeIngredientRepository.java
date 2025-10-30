package com.scentelier.backend.repository;

import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.CustomPerfumeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import com.scentelier.backend.dto.MostUsedIngredientDto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.List;

public interface CustomPerfumeIngredientRepository extends JpaRepository<CustomPerfumeIngredient, Long> {
    List<CustomPerfumeIngredient> findByCustomPerfume(CustomPerfume customPerfume);

    // 가장 많이 판매된 원액 조회 쿼리
    @Query("SELECT new com.scentelier.backend.dto.MostUsedIngredientDto(CAST(i.id AS int), i.name, SUM(cpi.amount)) " +
            "FROM CustomPerfumeIngredient cpi JOIN cpi.ingredients i " +
            "GROUP BY i.id, i.name " +
            "ORDER BY SUM(cpi.amount) DESC")
    List<MostUsedIngredientDto> findMostUsedIngredients(Pageable pageable);

}
