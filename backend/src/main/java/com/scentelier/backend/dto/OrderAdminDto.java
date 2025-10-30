package com.scentelier.backend.dto;
import com.scentelier.backend.entity.Orders;
import java.math.BigDecimal;

public class OrderAdminDto {

    private Long id;
    private String customerName;
    private String customerEmail;
    private String orderDate;
    private java.math.BigDecimal totalAmount;
    private String status;

    public OrderAdminDto() {}

    // 엔티티에 매핑 해주는 constructor
    public OrderAdminDto(Orders order) {
        this.id = order.getId();
        this.orderDate = order.getOrderDate().toString();
        this.totalAmount = order.getTotalPrice();
        this.status = order.getStatus().toString();

        // 사용자 정보
        if (order.getUsers() != null) {
            this.customerName = order.getUsers().getUsername();
            this.customerEmail = order.getUsers().getEmail();
        }
    }
    public Long getId() {
        return id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getOrderDate() {
        return orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getStatus() {
        return status;
    }
}