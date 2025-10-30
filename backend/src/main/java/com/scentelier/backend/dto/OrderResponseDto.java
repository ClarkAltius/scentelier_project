package com.scentelier.backend.dto;

import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.constant.Payment;
import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.Orders;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
    private Long orderId;
    private LocalDateTime orderDate;
    private String status;
    private String recipientName;
    private String address;
    private BigDecimal totalPrice;
    private String trackingNumber;
    private String paymentMethod;
    private List<OrderItem> orderItems;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderItem {
        private Long productId;
        private Long customId;
        private String productName;
        private int quantity;
        private BigDecimal price;
        private String type; //PRODUCT or CUSTOM
        private List<CustomPerfumeIngredientDto> ingredients; // 커스텀 향수 전용

        public OrderItem(Long productId, Long customId, @NotBlank(message = "향수 이름을 정해주세요.") String name, int quantity, BigDecimal price) {
            this.productId = productId;
            this.customId = customId;
            this.productName = name;
            this.quantity = quantity;
            this.price = price;
        }
    }

    // 관리자 페이지 주문 상세보기
    public OrderResponseDto(Orders order) {
        this.orderId = order.getId();
        this.orderDate = order.getOrderDate();
        this.recipientName = order.getRecipientName();
        this.address = order.getAddress();
        this.totalPrice = order.getTotalPrice();
        this.trackingNumber = order.getTrackingNumber();

        // ENUM 문자열로 변경, DTO에 반영
        if (order.getStatus() != null) {
            this.status = order.getStatus().name();
        }
        if (order.getPaymentMethod() != null) {
            this.paymentMethod = order.getPaymentMethod().name();
        }

        if (order.getOrderProducts() != null) {
            // 완제품, 커스텀 향수 둘 다 반환하도록 변경
            this.orderItems = order.getOrderProducts().stream()
                    .map(orderProduct -> {
                        // --- MERGED BLOCK START ---
                        OrderItem item = new OrderItem();
                        item.setQuantity(orderProduct.getQuantity());
                        item.setPrice(orderProduct.getPrice());

                        if (orderProduct.getProducts() != null) {
                            // 완제품
                            item.setProductId(orderProduct.getProducts().getId());
                            item.setProductName(orderProduct.getProducts().getName());
                            item.setType("PRODUCT");
                            item.setIngredients(Collections.emptyList());

                        } else if (orderProduct.getCustomPerfume() != null) {
                            // 커스텀 향수
                            CustomPerfume customPerfume = orderProduct.getCustomPerfume();
                            item.setCustomId(customPerfume.getId()); // <-- This is the fix
                            item.setProductName(customPerfume.getName()); // 커스텀 향수 이름
                            item.setType("CUSTOM");

                            // 원액 fetch / map
                            if (customPerfume.getCustomPerfumeIngredients() != null) {
                                item.setIngredients(
                                        customPerfume.getCustomPerfumeIngredients().stream()
                                                .map(CustomPerfumeIngredientDto::new) //DTO 에서 가져오기
                                                .collect(Collectors.toList())
                                );
                            } else {
                                item.setIngredients(Collections.emptyList());
                            }
                        } else {
                            // 해당 제품, 원액명이 없을 경우
                            item.setProductId(null);
                            item.setProductName("Unknown Item");
                            item.setType("UNKNOWN");
                            item.setIngredients(Collections.emptyList());
                        }

                        return item;
                        // --- MERGED BLOCK END ---
                    })
                    .collect(Collectors.toList());
        } else {
            this.orderItems = Collections.emptyList();
        }
    }
}