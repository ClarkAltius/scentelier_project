package com.scentelier.backend.repository;

import com.scentelier.backend.constant.ProductStatus;
import com.scentelier.backend.entity.Products;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Products, Long> {

    // 특정 수량 이하인 판매중인 완제품 리스트 반환
    List<Products> findByIsDeletedFalseAndStockLessThan(int stock, Pageable pageable);

    List<Products> findAllByIsDeletedFalseAndStockGreaterThan(int stock);
    Page<Products> findAllByIsDeleted(boolean isDeleted, Pageable pageable);

    // 기존: 이름/ID만
    @Query("""
           SELECT p FROM Products p
           WHERE p.isDeleted = false
             AND (
                 LOWER(p.name) LIKE :search
              OR str(p.id) LIKE :search
           )
           """)
    Page<Products> findAllByIsDeletedFalseAndSearch(@Param("search") String searchPattern, Pageable pageable);

    // 🔥 추가 1: 삭제 포함 전체 검색 (name/keyword/category/season/id)
    @Query("""
           SELECT p FROM Products p
           WHERE
             (LOWER(p.name) LIKE :search
              OR LOWER(COALESCE(p.keyword, '')) LIKE :search
              OR LOWER(CONCAT('', p.category)) LIKE :search
              OR LOWER(CONCAT('', p.season))   LIKE :search
              OR str(p.id) LIKE :search)
           """)
    Page<Products> findAllBySearch(@Param("search") String search, Pageable pageable);

    // 🔥 추가 2: 삭제 제외 검색 (name/keyword/category/season/id)
    @Query("""
           SELECT p FROM Products p
           WHERE p.isDeleted = false AND
             (LOWER(p.name) LIKE :search
              OR LOWER(COALESCE(p.keyword, '')) LIKE :search
              OR LOWER(CONCAT('', p.category)) LIKE :search
              OR LOWER(CONCAT('', p.season))   LIKE :search
              OR str(p.id) LIKE :search)
           """)
    Page<Products> findAllByIsDeletedFalseAndRichSearch(@Param("search") String search, Pageable pageable);

    // (선택) service.searchAdmin()에서 쓰고 싶다면 이 형태도 가능
    @Query("""
       SELECT p FROM Products p
       WHERE p.isDeleted = false
         AND (
              LOWER(p.name) LIKE CONCAT('%', :q, '%')
           OR LOWER(COALESCE(p.keyword, '')) LIKE CONCAT('%', :q, '%')
           OR str(p.id) LIKE CONCAT('%', :q, '%')
         )
       """)
    Page<Products> adminSearch(@Param("q") String q, Pageable pageable);

//    @Query("""
//       SELECT p FROM Products p
//       WHERE p.isDeleted = false
//         AND (
//              LOWER(p.name) LIKE CONCAT('%', :q, '%')
//           OR LOWER(COALESCE(p.keyword, '')) LIKE CONCAT('%', :q, '%')
//           OR str(p.id) LIKE CONCAT('%', :q, '%')
//           OR UPPER(CAST(p.category as string)) = UPPER(:q)   -- Hibernate 6에서 동작
//         )
//       """)
//    Page<Products> adminSearchWithCategory(@Param("q") String q, Pageable pageable);
}





