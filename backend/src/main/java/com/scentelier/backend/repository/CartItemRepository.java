package com.scentelier.backend.repository;

import com.scentelier.backend.entity.CartItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CartItemRepository extends JpaRepository<CartItems, Long> {
    @Query("""
        select count(ci) 
        from CartItems ci 
        where ci.product.id = :productId 
          and ci.quantity > 0
          
    """)
    long countActiveByProductId(Long productId);
}

