package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Reviews;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Reviews, Long> {

    // 주문으로 리뷰 존재 확인
    Optional<Reviews> findByOrder(Orders order);

    @Query("SELECT o FROM Orders o " +
            "WHERE o.users.id = :userId " +
            "AND o.status NOT IN ('PENDING', 'PAID', 'CANCELLED') " +
            "AND NOT EXISTS (SELECT r FROM Reviews r WHERE r.order.id = o.id) " +
            "ORDER BY o.orderDate DESC")
    List<Orders> findUnwrittenOrdersEntities(@Param("userId") Long userId);

    // 사용자 리뷰 조회
    @Query("SELECT r FROM Reviews r WHERE r.user.id = :userId AND r.isDeleted = false ORDER BY r.createdAt DESC")
    Page<Reviews> findAllByUserIdPaged(@Param("userId") Long userId, Pageable pageable);

    // 전체 리뷰 조회
    Page<Reviews> findAllByIsDeletedFalse(Pageable pageable);

    // 상품별 리뷰 조회
    @Query("SELECT r FROM Reviews r WHERE r.order.id IN (SELECT o.id FROM Orders o JOIN o.orderProducts op WHERE op.products.id = :productId) " +
            "AND r.isDeleted = false ORDER BY r.createdAt DESC")
    Page<Reviews> findAllByProductId(@Param("productId") Long productId, Pageable pageable);

    // 평균 별점
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Reviews r " +
            "WHERE r.order.id IN (SELECT o.id FROM Orders o JOIN o.orderProducts op WHERE op.products.id = :productId) " +
            "AND r.isDeleted = false")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    // 리뷰 개수
    @Query("SELECT COUNT(r) FROM Reviews r " +
            "WHERE r.order.id IN (SELECT o.id FROM Orders o JOIN o.orderProducts op WHERE op.products.id = :productId) " +
            "AND r.isDeleted = false")
    Long countReviewsByProductId(@Param("productId") Long productId);

    // 관리자 리뷰관리 페이지 용 쿼리
    @Query("SELECT r FROM Reviews r JOIN r.user u JOIN r.order o " +
            "WHERE (:search IS NULL OR r.content LIKE %:search% OR u.username LIKE %:search% OR u.email LIKE %:search%) " +
            "AND (:rating = -1 OR r.rating = :rating) " +
            "AND (:status IS NULL " +
            "  OR (:status = 'VISIBLE' AND r.isDeleted = false) " +
            "  OR (:status = 'DELETED' AND r.isDeleted = true)" +
            ")")
    Page<Reviews> findAdminReviews(
            Pageable pageable,
            @Param("search") String search,
            @Param("rating") int rating, // Use -1 to signify "All Ratings"
            @Param("status") String status // "VISIBLE", "DELETED", or null
    );
}


