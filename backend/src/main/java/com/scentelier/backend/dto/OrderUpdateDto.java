package com.scentelier.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OrderUpdateDto {

    @NotBlank(message = "Status 는 필수사항입니다.")
    private String status;
}