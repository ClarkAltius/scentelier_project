package com.scentelier.backend.controller;

import com.scentelier.backend.dto.IngredientStockDto;
import com.scentelier.backend.dto.ProductStockDto;
import com.scentelier.backend.service.IngredientService;
import com.scentelier.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    public AdminController(ProductService productService, IngredientService ingredientService) {
        this.productService = productService;
        this.ingredientService = ingredientService;
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
}

