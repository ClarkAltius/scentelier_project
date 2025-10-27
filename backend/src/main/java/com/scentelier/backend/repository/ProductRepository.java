package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Products;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Products, Long> {
    Page<Products> findAllByIsDeletedFalse(Pageable pageable);
    Page<Products> findAllByIsDeleted(boolean isDeleted, Pageable pageable);
    Optional<Products> findByIdAndIsDeletedFalse(Long id);

}

