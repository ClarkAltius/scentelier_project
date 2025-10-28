package com.scentelier.backend.service;

import com.scentelier.backend.entity.OrderProduct;
import com.scentelier.backend.repository.OrderProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderProductService {
    private final OrderProductRepository orderProductRepository;

    public List<OrderProduct> findByOrderId(Long orderId) {
        return orderProductRepository.findByOrders_Id(orderId);
    }
}
