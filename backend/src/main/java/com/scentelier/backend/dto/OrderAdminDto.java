package com.scentelier.backend.dto;
import com.scentelier.backend.entity.Orders;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class OrderAdminDto {

    private Long id;
    private String customerName;
    private String customerEmail;
    private String orderDate;
    private java.math.BigDecimal totalAmount;
    private String status;
    private String address;
    private String trackingNumber;

    public OrderAdminDto() {}

    // 엔티티에 매핑 해주는 constructor
    public OrderAdminDto(Orders order) {
        this.id = order.getId();
        this.orderDate = order.getOrderDate().toString();
        this.totalAmount = order.getTotalPrice();
        this.status = order.getStatus().toString();
        this.address = order.getAddress();
        this.trackingNumber = order.getTrackingNumber();


        // 사용자 정보
        if (order.getUsers() != null) {
            this.customerName = order.getUsers().getUsername();
            this.customerEmail = order.getUsers().getEmail();
        }
    }
}