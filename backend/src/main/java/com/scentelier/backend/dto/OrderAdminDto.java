package com.scentelier.backend.dto;

import com.scentelier.backend.entity.Orders;

import java.math.BigDecimal;

public class OrderAdminDto {

    private Long id;
    private String customerName;
    private String customerEmail;
    private String orderDate; // Or LocalDate, Instant, etc.
    private java.math.BigDecimal totalAmount;
    private String status;

    // --- Constructors ---

    public OrderAdminDto() {}

    // A helpful constructor to map from your Entity
    public OrderAdminDto(Orders order) {
        this.id = order.getId();
        this.orderDate = order.getOrderDate().toString(); // Format as needed
        this.totalAmount = order.getTotalPrice();
        this.status = order.getStatus().toString(); // Assuming status is an enum

        // Safely get user info
        if (order.getUsers() != null) { // From your JSON, the field is 'users'
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