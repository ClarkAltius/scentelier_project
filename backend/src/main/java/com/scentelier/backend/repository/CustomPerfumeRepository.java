package com.scentelier.backend.repository;

import com.scentelier.backend.entity.CustomPerfume;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomPerfumeRepository extends JpaRepository<CustomPerfume, Long> {
}
