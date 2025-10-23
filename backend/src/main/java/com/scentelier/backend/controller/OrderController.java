package com.scentelier.backend.controller;

import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    public ResponseEntity<?> createOrder(@RequestBody Orders orders) {
        return null;
    }

    @GetMapping("/list")
    public ResponseEntity<List<Products>> getBestList() {
        List<Products> products = orderService.getBestList();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/list2")
    public ResponseEntity<List<Products>> getBestList2() {
        List<Products> products = orderService.getBestList2();
        return ResponseEntity.ok(products);
    }
}
