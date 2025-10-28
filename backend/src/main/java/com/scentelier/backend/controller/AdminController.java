package com.scentelier.backend.controller;

import com.scentelier.backend.dto.*;
import com.scentelier.backend.entity.Inquiry;
import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.service.IngredientService;
import com.scentelier.backend.service.InquiryService;
import com.scentelier.backend.service.OrderService;
import com.scentelier.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {

    private final IngredientService ingredientService;
    private final ProductService productService;
    private final OrderService orderService;
    private final InquiryService inquiryService;

    @Autowired
    public AdminController(ProductService productService, IngredientService ingredientService, OrderService orderService, InquiryService inquiryService) {
        this.productService = productService;
        this.ingredientService = ingredientService;
        this.orderService = orderService;
        this.inquiryService = inquiryService;
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
        Page<Orders> orderPage = orderService.findAllOrders(pageable);
        Page<OrderAdminDto> dtoPage = orderPage.map(OrderAdminDto::new);
        return ResponseEntity.ok(dtoPage);
    }

   @GetMapping("/inquiries")
    public ResponseEntity<List<InquiryDto>> getInquiries(){
        List<InquiryDto> inquiryList = inquiryService.findAllWithUser();
        return ResponseEntity.ok(inquiryList);
    }



    // 주문 상세 조회 (관리자 페이지)
    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetail(@PathVariable("id") Long id) {
        OrderResponseDto orderResponseDto = orderService.getOrderDetail(id);
        return ResponseEntity.ok(orderResponseDto);
    }
    @PatchMapping("/orders/{orderId}")
    public ResponseEntity<OrderAdminDto> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid@RequestBody OrderUpdateDto updateDto)
    {
        OrderAdminDto updatedOrder = orderService.updateOrderStatus(orderId, updateDto.getStatus());

        return ResponseEntity.ok(updatedOrder);
    }

    // 재고 수량 변동 API 엔드포인트
    @PatchMapping("/products/stock/{itemId}")
    public ResponseEntity<ProductStockDto> updateProductStock(
            @PathVariable Long itemId,
            @Valid @RequestBody StockUpdateDto dto){
        ProductStockDto updateProduct = productService.updateStock(itemId, dto.getAdjustment());
        return ResponseEntity.ok(updateProduct);
    }

    @PatchMapping("/ingredients/stock/{itemId}")
    public ResponseEntity<IngredientStockDto> updateIngredientStock(
            @PathVariable Long itemId,
            @Valid @RequestBody StockUpdateDto dto){
        IngredientStockDto updateIngredient = ingredientService.updateStock(itemId, dto.getAdjustment());
        return ResponseEntity.ok(updateIngredient);
    }
}

