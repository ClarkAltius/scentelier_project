package com.scentelier.backend.dto;

import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.constant.Payment;
import com.scentelier.backend.entity.Orders;
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
    public static class OrderItem {
        private Long productId;
        private Long customId;
        private String productName;
        private int quantity;
        private BigDecimal price;
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
            this.orderItems = order.getOrderProducts().stream()
                    .map(orderProduct -> {

                        Long productId = null;
                        Long customId = null;
                        String name = "Unknown Item"; // Default name

                        if (orderProduct.getProducts() != null) {
                            productId = orderProduct.getProducts().getId();
                            name = orderProduct.getProducts().getName();
                        }
                        else if (orderProduct.getCustomPerfume() != null) {
                            customId = orderProduct.getCustomPerfume().getId();
                            name = orderProduct.getCustomPerfume().getName();
                        }

                        return new OrderItem(
                                productId,
                                customId,
                                name,
                                orderProduct.getQuantity(),
                                orderProduct.getPrice()
                        );
                    })
                    .collect(Collectors.toList());
        } else {
            this.orderItems = Collections.emptyList();
        }

    }
}
