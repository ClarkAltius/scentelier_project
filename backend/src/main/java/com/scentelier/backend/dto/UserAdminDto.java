package com.scentelier.backend.dto;

import com.scentelier.backend.constant.Role;
import com.scentelier.backend.entity.Users;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UserAdminDto {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String address;
    private Role role;
    private LocalDate createdAt;
    private String status; // "ACTIVE" or "INACTIVE"

    // Calculated fields
    private Long totalOrders;
    private BigDecimal totalExpenditure;

    // This constructor will be used by our JPQL query
    public UserAdminDto(Long id, String username, String email, String phone, String address, Role role, LocalDate createdAt, boolean isDeleted, Long totalOrders, BigDecimal totalExpenditure) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.role = role;
        this.createdAt = createdAt;

        // Compute the status string
        this.status = isDeleted ? "INACTIVE" : "ACTIVE";

        this.totalOrders = totalOrders;
        this.totalExpenditure = totalExpenditure;
    }

    public UserAdminDto(Users user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.address = user.getAddress();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();

        this.status = user.isDeleted() ? "INACTIVE" : "ACTIVE";

        this.totalOrders = 0L;
        this.totalExpenditure = BigDecimal.ZERO;
    }
}