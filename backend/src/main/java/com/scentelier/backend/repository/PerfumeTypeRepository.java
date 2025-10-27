package com.scentelier.backend.repository;

import com.scentelier.backend.entity.PerfumeTypeRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PerfumeTypeRepository extends JpaRepository<PerfumeTypeRecommendation, Long>{

    List<PerfumeTypeRecommendation> findByPerfumeType(String perfumeType);
}
