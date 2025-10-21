package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Products;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Products, Long> {
}
