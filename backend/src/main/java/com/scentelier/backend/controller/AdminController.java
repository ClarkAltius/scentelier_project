package com.scentelier.backend.controller;

import com.scentelier.backend.constant.ProductStatus;
import com.scentelier.backend.dto.*;
import com.scentelier.backend.entity.Inquiry;
import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.service.IngredientService;
import com.scentelier.backend.service.InquiryService;
import com.scentelier.backend.service.OrderService;
import com.scentelier.backend.service.ProductService;
import com.scentelier.backend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import com.scentelier.backend.service.ReviewService;
import com.scentelier.backend.dto.ReviewAdminDto;
import com.scentelier.backend.dto.ReviewStatusUpdateDto;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {

    private final IngredientService ingredientService;
    private final ProductService productService;
    private final OrderService orderService;
    private final InquiryService inquiryService;
    private final PurchaseOrderService purchaseOrderService;
    private final UserService userService;
    private final ReviewService reviewService;

    @Autowired
    public AdminController(ProductService productService, IngredientService ingredientService, OrderService orderService, InquiryService inquiryService, PurchaseOrderService purchaseOrderService, UserService userService,ReviewService reviewService) {
        this.productService = productService;
        this.ingredientService = ingredientService;
        this.orderService = orderService;
        this.inquiryService = inquiryService;
        this.purchaseOrderService = purchaseOrderService;
        this.userService = userService;
        this.reviewService = reviewService;
    }


    @GetMapping("/test")
    public ResponseEntity<String> getAdminData() {
        return ResponseEntity.ok("관리자 권한이 필요한 데이터입니다.");
    }

    @GetMapping("/products/stock")
    public ResponseEntity<Page<ProductStockDto>> getProductStock(
            Pageable pageable,
            @RequestParam(value = "search", required = false) String search
            ) {
        Page<ProductStockDto> stockData = productService.getProductStock(search, pageable);
        return ResponseEntity.ok(stockData);
    }


    @GetMapping("/ingredients/stock")
    public ResponseEntity<Page<IngredientStockDto>> getIngredientStock(
            Pageable pageable,
            @RequestParam(value="search", required = false) String search
    ) {
        Page<IngredientStockDto> stockData = ingredientService.getIngredientStock(search, pageable);
        return ResponseEntity.ok(stockData);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(Pageable pageable) {
        Page<Orders> orderPage = orderService.findAllOrders(pageable);
        Page<OrderAdminDto> dtoPage = orderPage.map(OrderAdminDto::new);
        return ResponseEntity.ok(dtoPage);
    }

   @GetMapping("/inquiries")
    public ResponseEntity<Page<InquiryDto>> getInquiries(
            Pageable pageable,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "type", required = false) String type){
        Page<InquiryDto> inquiryPage = inquiryService.findAllWithUser(pageable, search, type, status);
        return ResponseEntity.ok(inquiryPage);
    }

    // 문의사항 상세내역 GET API 엔드포인트
    @GetMapping("/inquiries/{inquiryId}")
    public ResponseEntity<InquiryDto> getInquiryDetail(
            @PathVariable Long inquiryId){
        InquiryDto inquiryDto = inquiryService.getInquiryDetail(inquiryId);
        return ResponseEntity.ok(inquiryDto);
    }

    // 문의사항 관리자 답변 POST API 엔드포인트
    @PostMapping("/inquiries/{inquiryId}/answers")
    public ResponseEntity<InquiryAnswerResponseDto> saveInquiryAnswer(
            @PathVariable Long inquiryId,
            @Valid @RequestBody InquiryAnswerRequestDto answerDto,
            Principal principal){
        
        // 스프링 시큐리티에서 체크하게 되어있지만 2중 안전장치
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String adminEmail = principal.getName();

        InquiryAnswerResponseDto inquiryAnswerResponseDto =
                inquiryService.submitAnswer(inquiryId, answerDto, adminEmail);

        return ResponseEntity.ok(inquiryAnswerResponseDto);
    }

    // 문의사항 완료처리 API 엔드포인트
    @PatchMapping("/inquiries/{inquiryId}/status")
    public ResponseEntity<InquiryDto> closeInquiry(
            @PathVariable Long inquiryId,
            @Valid @RequestBody InquiryStatusUpdateDto statusDto){

                InquiryDto updatedInquiry = inquiryService.updateInquiryStatus(
                    inquiryId,
                    statusDto.getStatus()
        );
        return ResponseEntity.ok(updatedInquiry);
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
        OrderAdminDto updatedOrder = orderService.updateOrderStatus(orderId, updateDto);

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

    @PostMapping("/generate-purchase-order")
    public ResponseEntity<byte[]> generatePurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequestDto requestDto) {

        try {
            byte[] excelBytes = purchaseOrderService.generatePurchaseOrderExcel(requestDto);

            // Set HTTP headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            // The filename for the download
            headers.setContentDispositionFormData("attachment", requestDto.getPoNumber() + ".xlsx");
            headers.setContentLength(excelBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelBytes);

        } catch (Exception e) {
            // error log
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/products")
    public ResponseEntity<Page<Map<String, Object>>> getAdminProducts(
            Pageable pageable,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "includeDeleted", defaultValue = "true") boolean includeDeleted
    ) {
        // ★ 로그로 q가 실제로 들어오는지 바로 확인
        System.out.println("[ADMIN /products] q=" + q + ", page=" + pageable.getPageNumber());

        Page<Products> page = productService.findAdminProducts(pageable, q, includeDeleted);

        List<Map<String, Object>> content = page.getContent().stream().map(p -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("description", p.getDescription());
            m.put("price", p.getPrice());
            m.put("stock", p.getStock());
            m.put("category", p.getCategory());
            m.put("imageUrl", p.getImageUrl());
            m.put("season", p.getSeason());
            m.put("keyword", p.getKeyword());
            m.put("createdAt", p.getCreatedAt());
            m.put("isDeleted", p.isDeleted());
            m.put("deletedAt", p.getDeletedAt());
            m.put("status", productService.computeStatus(p));
            return m;
        }).toList();

        return ResponseEntity.ok(new PageImpl<>(content, page.getPageable(), page.getTotalElements()));
    }

    // 관리자 상세
    @GetMapping("/products/{id}")
    public ResponseEntity<?> getAdminProductDetail(@PathVariable Long id) {
        Products p = productService.ProductById(id);
        if (p == null) return ResponseEntity.status(404).body("상품 없음: " + id);
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("description", p.getDescription());
        m.put("price", p.getPrice());
        m.put("stock", p.getStock());
        m.put("category", p.getCategory());
        m.put("imageUrl", p.getImageUrl());
        m.put("season", p.getSeason());
        m.put("keyword", p.getKeyword());
        m.put("createdAt", p.getCreatedAt());
        m.put("isDeleted", p.isDeleted());
        m.put("deletedAt", p.getDeletedAt());
        m.put("status", productService.computeStatus(p));
        return ResponseEntity.ok(m);
    }

    // 관리자: 판매중지/판매시작 토글 (status=STOPPED|SELLING)
    @PatchMapping("/products/{id}/status")
    public ResponseEntity<?> adminUpdateProductStatus(@PathVariable Long id,
                                                      @RequestParam("status") String statusText) {
        try {
            boolean stop;
            if ("STOPPED".equalsIgnoreCase(statusText)) stop = true;
            else if ("SELLING".equalsIgnoreCase(statusText)) stop = false;
            else return ResponseEntity.badRequest().body("허용되지 않는 status 값입니다.");

            Products updated = productService.updateSellingFlag(id, stop);
            String computed = productService.computeStatus(updated);
            return ResponseEntity.ok(Map.of("status", computed));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage()); // 장바구니/진행주문 있을 때
        }
    }

    // 관리자: 판매재개(복구) 별도 엔드포인트(선호 시)
    @PatchMapping("/products/{id}/restore")
    public ResponseEntity<?> adminRestoreProduct(@PathVariable Long id) {
        try {
            Products restored = productService.restoreDeleted(id);
            return ResponseEntity.ok(Map.of(
                    "id", restored.getId(),
                    "isDeleted", restored.isDeleted(),
                    "status", productService.computeStatus(restored)
            ));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("복구 중 오류: " + e.getMessage());
        }
    }

    // ======== 유저관리 엔드포인트 시작 ==========
    @GetMapping("/users")
    public ResponseEntity<Page<UserAdminDto>> getUsers(
            Pageable pageable,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status
    ) {
        Page<UserAdminDto> userPage = userService.getUsers(pageable, search, status);
        return ResponseEntity.ok(userPage);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserAdminDto> getUserDetail(@PathVariable Long id) {
        UserAdminDto userDetail = userService.getUserDetail(id);
        return ResponseEntity.ok(userDetail);
    }

    @GetMapping("/users/{id}/orders")
    public ResponseEntity<Page<OrderAdminDto>> getUserOrders(
            @PathVariable Long id,
            Pageable pageable
    ) {
        Page<OrderAdminDto> orderPage = orderService.findOrdersByUserId(id, pageable);
        return ResponseEntity.ok(orderPage);
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<UserAdminDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserAdminUpdateDto updateDto
    ) {
        UserAdminDto updatedUser = userService.updateUser(id, updateDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserAdminDto> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateDto statusDto
    ) {
        UserAdminDto updatedUser = userService.updateUserStatus(id, statusDto);
        return ResponseEntity.ok(updatedUser);
    }
    // ======== 유저관리 엔드포인트 끝 ==========

    // === REVIEW MANAGEMENT ENDPOINTS ===

    @GetMapping("/reviews")
    public ResponseEntity<Page<ReviewAdminDto>> getReviews(
            Pageable pageable,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "rating", required = false, defaultValue = "-1") int rating,
            @RequestParam(value = "status", required = false) String status
    ) {
        Page<ReviewAdminDto> reviewPage = reviewService.getReviews(pageable, search, rating, status);
        return ResponseEntity.ok(reviewPage);
    }

    @PatchMapping("/reviews/{id}/status")
    public ResponseEntity<ReviewAdminDto> updateReviewStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReviewStatusUpdateDto statusDto
    ) {
        ReviewAdminDto updatedReview = reviewService.updateReviewStatus(id, statusDto);
        return ResponseEntity.ok(updatedReview);
    }

}


