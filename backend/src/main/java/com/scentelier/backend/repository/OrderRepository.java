package com.scentelier.backend.repository;
import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.dto.analytics.DailySalesDto;
import com.scentelier.backend.dto.analytics.DailyAovDto;
import com.scentelier.backend.dto.analytics.TopCustomerDto;
import com.scentelier.backend.entity.OrderProduct;
import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Products;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    WHERE p.is_deleted = 0            -- 삭제되지 않은 상품만
     AND p.stock > 0 
    GROUP BY p.product_id             -- 혹시 모를 중복 방지
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
    WHERE p.is_deleted = 0            -- 삭제되지 않은 상품만
     AND p.stock > 0 
     
    GROUP BY p.product_id             -- 혹시 모를 중복 방지
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
             and o.status in :statuses
           """)
    long countPendingOrdersByProductId(@Param("productId") Long productId,
                                       @Param("statuses") List<OrderStatus> statuses);

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
            "ORDER BY month ASC")
    List<Object[]> findMonthlySales();
    Page<Orders> findByUsers_IdOrderByOrderDateDesc(Long userId, Pageable pageable);

    @Query("SELECT new com.scentelier.backend.dto.analytics.TopCustomerDto(" +
            "   u.id, " +
            "   u.email, " +
            "   COUNT(o.id), " +
            "   CAST(COALESCE(SUM(o.totalPrice), 0) AS long)" +
            ") " +
            "FROM Orders o " +
            "JOIN o.users u " +
            "WHERE o.orderDate BETWEEN :startDate AND :endDate " +
            "  AND o.users IS NOT NULL " +
            "GROUP BY u.id, u.email " +
            "ORDER BY SUM(o.totalPrice) DESC")
    List<TopCustomerDto> findTopCustomers(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    // 상세 통계 페이지 평균 주문액 표 쿼리
    @Query("SELECT new com.scentelier.backend.dto.analytics.DailyAovDto(" +
            "   str(DATE(o.orderDate)), " +
            "   COALESCE(AVG(o.totalPrice), 0.0) " +
            ") " +
            "FROM Orders o " +
            "WHERE o.orderDate BETWEEN :startDate AND :endDate " +
            "  AND o.status <> 'CANCELLED' " +
            "GROUP BY str(DATE(o.orderDate)) " +
            "ORDER BY str(DATE(o.orderDate)) ASC")
    List<DailyAovDto> findDailyAov(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // 상세 통계 페이지 고객 재주문율 쿼리
    @Query(value = "SELECT " +
            "   DATE_FORMAT(o.order_date, '%Y-%m-%d') as day, " +
            "   COUNT(DISTINCT CASE WHEN DATE(o.order_date) = (SELECT MIN(DATE(o2.order_date)) FROM orders o2 WHERE o2.user_id = o.user_id AND o2.status != 'CANCELLED') THEN o.user_id ELSE NULL END) as new_cust, " +
            "   COUNT(DISTINCT CASE WHEN DATE(o.order_date) > (SELECT MIN(DATE(o3.order_date)) FROM orders o3 WHERE o3.user_id = o.user_id AND o3.status != 'CANCELLED') THEN o.user_id ELSE NULL END) as ret_cust " +
            "FROM orders o " +
            "WHERE o.order_date BETWEEN :startDate AND :endDate " +
            "  AND o.status != 'CANCELLED' " +
            "GROUP BY day " +
            "ORDER BY day ASC",
            nativeQuery = true)
    List<Object[]> findCustomerBreakdown(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}