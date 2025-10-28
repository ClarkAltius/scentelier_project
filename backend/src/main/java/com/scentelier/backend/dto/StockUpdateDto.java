package com.scentelier.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockUpdateDto {

    @NotNull(message = "Stock value cannot be null.")
    private Integer adjustment;
    }
