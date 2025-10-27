package com.scentelier.backend.service;

import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.dto.OrderAdminDto;
import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import com.scentelier.backend.event.OrderCancelledEvent;
import org.springframework.context.ApplicationEventPublisher;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public List<Products> getBestList() {
        List<Products> products = orderRepository.findBestList();
        return products != null ? products : Collections.emptyList();
    }

    public List<Products> getBestList2() {
        List<Products> products = orderRepository.findBestList2();
        return products != null ? products : Collections.emptyList();
    }

    public void save(Orders orders) {
        orderRepository.save(orders);
    }

    public List<Orders> getOrderList() {
        return orderRepository.findAll();
    }

    public Page<Orders> findAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Transactional
    public OrderAdminDto updateOrderStatus(Long orderId, String newStatus) {
        // 주문 검색. 없으면 에러
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + orderId));
        // status 갱신
        OrderStatus newOrderStatus;
        try {
            newOrderStatus = OrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + newStatus);
        }

        // (Add your state machine logic here if you want)

        order.setStatus(newOrderStatus);
        Orders savedOrder = orderRepository.save(order);

        // --- Add this logic ---
        // If the order was cancelled, publish an event
        if (newOrderStatus == OrderStatus.CANCELLED) {
            // This sends the "broadcast"
            eventPublisher.publishEvent(new OrderCancelledEvent(savedOrder));
        }

        // DTO 반환
        return new OrderAdminDto(savedOrder);
    }
    public List<Orders> findByUserId(Long userId) {
        return orderRepository.findByUsers_IdOrderByOrderDateDesc(userId);
    }


}
