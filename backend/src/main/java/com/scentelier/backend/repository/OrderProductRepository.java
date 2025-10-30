package com.scentelier.backend.repository;

import com.scentelier.backend.entity.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import com.scentelier.backend.dto.BestSellerDto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
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

}
