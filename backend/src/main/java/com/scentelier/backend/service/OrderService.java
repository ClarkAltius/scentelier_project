package com.scentelier.backend.service;

import com.scentelier.backend.entity.Products;
import com.scentelier.backend.repository.OrderRepository;
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
}
