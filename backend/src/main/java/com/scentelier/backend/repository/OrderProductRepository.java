package com.scentelier.backend.repository;

import com.scentelier.backend.dto.analytics.CategorySalesDto;
import com.scentelier.backend.dto.analytics.DailySalesDto;
import com.scentelier.backend.dto.analytics.ProductPerformanceDto;
import com.scentelier.backend.entity.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import com.scentelier.backend.dto.BestSellerDto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;


public interface OrderProductRepository extends JpaRepository<OrderProduct, Long> {
    List<OrderProduct> findByOrders_Id(Long orderId);

    
    // 최근 베스트 판매수량 조회 쿼리
    @Query("SELECT new com.scentelier.backend.dto.BestSellerDto(CAST(p.id AS int), p.name, SUM(op.quantity)) " +
            "FROM OrderProduct op JOIN op.products p " +
            "WHERE p.isDeleted = false " +
            "GROUP BY p.id, p.name " +
            "ORDER BY SUM(op.quantity) DESC")
    List<BestSellerDto> findBestSellers(Pageable pageable);

    // 관리자 페이지 매출 중 비중 조회, 취소 안된 주문만
    @Query("SELECT CASE WHEN op.products IS NOT NULL THEN 'FINISHED' ELSE 'CUSTOM' END AS productType, " +
            "SUM(op.price * op.quantity) AS totalSales " +
            "FROM OrderProduct op " +
            "WHERE op.orders.status != 'CANCELLED' " +
            "GROUP BY productType")
    List<Object[]> findSalesBreakdownByType();

    // 상세 통계 창 상품 성적
    /**
     * NOTE: NATIVE SQL query.
     * 재구매율 계산을 위한 쿼리
     * 일반 JPQL 에서는 불가능.
     * raw List of Object arrays 반환. 서비스 레이어에서 수동 맵핑 필요.
     * 매우 비효율적인 계산식임으로 실제 상업용 코드에선 하루에 한번 작동하도록 하는 등 제한을 두는게 낫다고...?
     * ===
     * 또한 상품에 리뷰가 없고 주문에 리뷰에 묶여있는 특성상 정확한 상품 별 별점은 알 수 없으나, 상품을 포함한 주문 별점을 프록시로 사용, 상품 별점으로 간주함.
     * 실제 상업용 웹사이트에선 상품에 별점을 묶는 것이 나을 것 같다.
     * ===
     */
    @Query(value = "SELECT " +
            "   p.product_id AS id, " +
            "   p.name AS name, " +
            "   p.category AS category, " +
            "   p.season AS season, " +
            "   COALESCE(SUM(op.quantity), 0) AS unitsSold, " +
            "   COALESCE(SUM(op.price * op.quantity), 0.0) AS revenue, " +

            "   /* --- THIS IS THE FIX --- */" +
            "   COALESCE(AVG(r.rating), 0.0) AS avgRating, " +
            "   /* --- END OF FIX --- */" +

            "   /* --- Footnote: Repurchase Rate Calculation --- */" +
            "   COALESCE( " +
            "       ( " +
            "           ( " +
            "               SELECT COUNT(T1.user_id) " +
            "               FROM ( " +
            "                   SELECT o2.user_id " +
            "                   FROM order_product op2 " +
            "                   JOIN orders o2 ON op2.order_id = o2.order_id " +
            "                   WHERE op2.product_id = p.product_id " +
            "                     AND o2.status <> 'CANCELLED' " +
            "                     AND (o2.order_date BETWEEN :startDate AND :endDate) " +
            "                   GROUP BY o2.user_id " +
            "                   HAVING COUNT(DISTINCT o2.order_id) > 1 " +
            "               ) AS T1 " +
            "           ) " +
            "       ) / NULLIF(COUNT(DISTINCT o.user_id), 0) " +
            "   , 0.0) AS rePurchaseRate " +
            "   /* --- End of Repurchase Rate --- */" +

            "FROM order_product op " +
            "JOIN products p ON op.product_id = p.product_id " +
            "JOIN orders o ON op.order_id = o.order_id " +

            "   /* --- THIS IS THE OTHER FIX (adding the join) --- */" +
            "LEFT JOIN reviews r ON o.order_id = r.order_id " +
            "   /* --- END OF FIX --- */" +

            "WHERE (o.order_date BETWEEN :startDate AND :endDate) " +
            "  AND (o.status <> 'CANCELLED') " +
            "  AND op.product_id IS NOT NULL " +
            "  AND (:categories IS NULL OR p.category IN (:categories)) " +
            "GROUP BY p.product_id, p.name, p.category, p.season " +
            "ORDER BY revenue DESC",
            nativeQuery = true)
    List<Object[]> findProductPerformanceNative(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("categories") List<String> categories
    );

    // 상세 통계 표 작석용 쿼리
    @Query("SELECT new com.scentelier.backend.dto.analytics.DailySalesDto(" +
            "   str(DATE(o.orderDate)), " +
            "   CAST(COALESCE(SUM(op.price * op.quantity), 0.0) AS Double) " +
            ") " +
            "FROM OrderProduct op " +
            "JOIN op.orders o " +
            "WHERE (o.orderDate BETWEEN :startDate AND :endDate) " +
            "  AND (o.status <> 'CANCELLED') " +
            "  AND ( :productType = 'all' " +
            "        OR (:productType = 'finished' AND op.products IS NOT NULL) " +
            "        OR (:productType = 'custom' AND op.customPerfume IS NOT NULL) " +
            "      ) " +
            "GROUP BY str(DATE(o.orderDate)) " + // Group by the calendar date
            "ORDER BY str(DATE(o.orderDate)) ASC") // Order chronologically
    List<DailySalesDto> findDailySales(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("productType") String productType
    );

    // 상세 통계 페이지 종류별 판매량 집계용 쿼리
    @Query("SELECT new com.scentelier.backend.dto.analytics.CategorySalesDto(" +
            "   p.category, " +
            "   CAST(COALESCE(SUM(op.price * op.quantity), 0.0) AS long) " +
            ") " +
            "FROM OrderProduct op " +
            "JOIN op.products p " + // Inner join automatically filters to only finished products
            "JOIN op.orders o " +
            "WHERE (o.orderDate BETWEEN :startDate AND :endDate) " +
            "  AND (o.status <> 'CANCELLED') " +
            "  AND p.category IS NOT NULL " + // Ensure we don't get a null category group
            "GROUP BY p.category " +
            "ORDER BY COALESCE(SUM(op.price * op.quantity), 0.0) DESC")
    List<CategorySalesDto> findSalesByCategory(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

}
