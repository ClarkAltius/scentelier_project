package com.scentelier.backend.dto;

import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.constant.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    public static class OrderItem {
        private Long productId;
        private String productName;
        private int quantity;
        private BigDecimal price;
    }
}
