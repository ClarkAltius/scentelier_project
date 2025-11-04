package com.scentelier.backend.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserStatusUpdateDto {
    @Pattern(regexp = "ACTIVE|INACTIVE", message = "Status must be ACTIVE or INACTIVE")
    private String status;
}