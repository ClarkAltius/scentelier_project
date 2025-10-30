package com.scentelier.backend.repository;

import com.scentelier.backend.constant.ProductStatus;
import com.scentelier.backend.entity.Products;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Products, Long> {
    List<Products> findAllByIsDeletedFalse(); // ✅ 페이징 없이 전체 반환
    Page<Products> findAllByIsDeleted(boolean isDeleted, Pageable pageable);
  //  Optional<Products> findByIdAndIsDeletedFalse(Long id);
//    Page<Products> findAllByStatusAndIsDeletedFalse(ProductStatus status, Pageable pageable);

    // 특정 수량 이하인 판매중인 완제품 리스트 반환
    List<Products> findByIsDeletedFalseAndStockLessThan(int stock, Pageable pageable);

}

