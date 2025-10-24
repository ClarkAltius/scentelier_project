package com.scentelier.backend.service;

import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

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
}
