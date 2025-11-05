package com.scentelier.backend.dto;

import com.scentelier.backend.constant.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserAdminUpdateDto {
    private String username;
    private String phone;
    private String address;

    @NotNull
    private Role role;
}