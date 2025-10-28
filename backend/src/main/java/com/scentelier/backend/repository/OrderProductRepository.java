package com.scentelier.backend.repository;

import com.scentelier.backend.entity.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderProductRepository extends JpaRepository<OrderProduct, Long> {
    List<OrderProduct> findByOrders_Id(Long orderId);
}
