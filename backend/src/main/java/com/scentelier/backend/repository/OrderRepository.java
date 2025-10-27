package com.scentelier.backend.repository;
import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Products;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Long> {

    @Query(value = """
           SELECT o.*, p.*
               FROM orders o
               JOIN order_product op ON o.order_id = op.order_id
               JOIN products p ON op.product_id = p.product_id
               WHERE o.order_date >= CURDATE() - INTERVAL 30 DAY
               ORDER BY o.order_date DESC
                   LIMIT 3;
        """, nativeQuery = true)
    List<Products> findBestList();

    @Query(value = """
           SELECT o.*, p.*
               FROM orders o
               JOIN order_product op ON o.order_id = op.order_id
               JOIN products p ON op.product_id = p.product_id
               WHERE o.order_date >= CURDATE() - INTERVAL 30 DAY
               ORDER BY o.order_date DESC
                   LIMIT 5;
        """, nativeQuery = true)
    List<Products> findBestList2();

    List<Orders> findByUsers_IdOrderByOrderDateDesc(Long userId);
}
