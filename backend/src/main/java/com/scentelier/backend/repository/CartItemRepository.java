package com.scentelier.backend.repository;

import com.scentelier.backend.entity.CartItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItems, Long> {

    @Query(value = """
        SELECT COUNT(*)
        FROM cart_item ci
        WHERE ci.product_id = :productId
          AND ci.quantity > 0
          AND ci.is_deleted = 0
    """, nativeQuery = true)
    long countActiveByProductId(@Param("productId") Long productId);
}

