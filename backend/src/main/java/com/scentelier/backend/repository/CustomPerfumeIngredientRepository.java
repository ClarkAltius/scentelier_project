package com.scentelier.backend.repository;

import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.CustomPerfumeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import com.scentelier.backend.dto.analytics.MostUsedIngredientDto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CustomPerfumeIngredientRepository extends JpaRepository<CustomPerfumeIngredient, Long> {
    List<CustomPerfumeIngredient> findByCustomPerfume(CustomPerfume customPerfume);

    // 가장 많이 판매된 원액 조회 쿼리
    @Query("SELECT new com.scentelier.backend.dto.analytics.MostUsedIngredientDto(" +
            "   CAST(i.id AS int), " + // Cast Long ID to Integer to match DTO
            "   i.name, " +
            "   SUM(cpi.amount) " + // Sum the BigDecimal amount
            ") " +
            "FROM CustomPerfumeIngredient cpi " +
            "JOIN cpi.ingredients i " + // Uses 'ingredients' (plural) field from entity
            "JOIN cpi.customPerfume cp " + // Join to filter by date if needed
            "GROUP BY i.id, i.name " +
            "ORDER BY SUM(cpi.amount) DESC")
    List<MostUsedIngredientDto> findMostUsedIngredients(Pageable pageable);
}
