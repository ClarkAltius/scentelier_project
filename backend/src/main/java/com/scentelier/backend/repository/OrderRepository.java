package com.scentelier.backend.repository;
import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.entity.OrderProduct;
import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Products;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Long> {

    @Query(value = """
    SELECT p.*
    FROM products p
    JOIN (
        SELECT op.product_id, MAX(o.order_date) AS last_order
        FROM order_product op
        JOIN orders o ON o.order_id = op.order_id
        WHERE o.order_date >= CURDATE() - INTERVAL 30 DAY
        GROUP BY op.product_id
    ) recent ON p.product_id = recent.product_id
    ORDER BY recent.last_order DESC
    LIMIT 3;
""", nativeQuery = true)
    List<Products> findBestList();

    @Query(value = """
    SELECT p.*
    FROM products p
    JOIN (
        SELECT op.product_id, MAX(o.order_date) AS last_order
        FROM order_product op
        JOIN orders o ON o.order_id = op.order_id
        WHERE o.order_date >= CURDATE() - INTERVAL 30 DAY
        GROUP BY op.product_id
    ) recent ON p.product_id = recent.product_id
    ORDER BY recent.last_order DESC
    LIMIT 5;
""", nativeQuery = true)
    List<Products> findBestList2();

    List<Orders> findByUsers_IdOrderByOrderDateDesc(Long userId);

    @Modifying
    @Transactional
    @Query("update Orders o set o.status=:status where o.id=:orderId")
    int updateOrderStatus(@Param("orderId") Long orderId, @Param("status") OrderStatus status);

    @Query("""
        select count(op)
        from OrderProduct op
          join op.orders o
        where op.products.id = :productId
          and o.status in (:statuses)
    """)
    long countPendingOrdersByProductId(
            @Param("productId") Long productId,
            @Param("statuses") List<OrderStatus> statuses
    );
    //  총 주문량 반환 쿼리, 취소 안된 주문만
    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Orders o WHERE o.status != 'CANCELLED'")
    long sumTotalRevenue();

    // 상태별 갯수 반환
    int countByStatus(OrderStatus status);

    // 월별 판매 추이 반환
    @Query("SELECT FUNCTION('DATE_FORMAT', o.orderDate, '%Y-%m') AS month, SUM(o.totalPrice) AS monthlySales " +
            "FROM Orders o " +
            "WHERE o.status != 'CANCELLED'" +
            "GROUP BY month " +
            "ORDER BY month DESC")
    List<Object[]> findMonthlySales();

}
