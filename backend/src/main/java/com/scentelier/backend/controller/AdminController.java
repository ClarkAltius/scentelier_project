package com.scentelier.backend.controller;

import com.scentelier.backend.dto.IngredientStockDto;
import com.scentelier.backend.dto.OrderAdminDto;
import com.scentelier.backend.dto.ProductStockDto;
import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.service.IngredientService;
import com.scentelier.backend.service.OrderService;
import com.scentelier.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final IngredientService ingredientService;
    private final ProductService productService;
    private final OrderService orderService;

    @Autowired
    public AdminController(ProductService productService, IngredientService ingredientService, OrderService orderService) {
        this.productService = productService;
        this.ingredientService = ingredientService;
        this.orderService = orderService;
    }


    @GetMapping("/test")
    public ResponseEntity<String> getAdminData() {
        return ResponseEntity.ok("관리자 권한이 필요한 데이터입니다.");
    }

    @GetMapping("/products/stock")
    public ResponseEntity<List<ProductStockDto>> getProductStock() {
        List<ProductStockDto> stockData = productService.getProductStock();
        return ResponseEntity.ok(stockData);
    }

    @GetMapping("/ingredients/stock")
    public ResponseEntity<List<IngredientStockDto>> getIngredientStock() {
        List<IngredientStockDto> stockData = ingredientService.getIngredientStock();
        return ResponseEntity.ok(stockData);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(Pageable pageable) {

        // 1. Fetch your entities from the service/repository
        //    Your React code expects a 'content' field, so you're likely using Pagination.
        Page<Orders> orderPage = orderService.findAllOrders(pageable);

        // 2. Map the Page of entities to a Page of DTOs
        Page<OrderAdminDto> dtoPage = orderPage.map(OrderAdminDto::new);

        // 3. Return the DTO Page. Jackson can serialize this perfectly.
        return ResponseEntity.ok(dtoPage);
    }
}

