package com.scentelier.backend.controller;

import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    public ResponseEntity<?> createOrder(@RequestBody Orders orders) {


        return null;
    }
}
