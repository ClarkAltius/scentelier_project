package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Reviews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Reviews, Long> {

    // 주문으로 리뷰 존재 확인
    Optional<Reviews> findByOrder(Orders order);

    @Query("SELECT o FROM Orders o WHERE o.users.id = :userId AND NOT EXISTS " +
            "(SELECT r FROM Reviews r WHERE r.order.id = o.id AND r.isDeleted = false) " +
            "ORDER BY o.orderDate DESC")
    List<Orders> findUnwrittenOrdersEntities(@Param("userId") Long userId);

    // 사용자 리뷰 조회
    @Query("SELECT r FROM Reviews r WHERE r.user.id = :userId AND r.isDeleted = false ORDER BY r.createdAt DESC")
    List<Reviews> findAllByUserId(@Param("userId") Long userId);
}
