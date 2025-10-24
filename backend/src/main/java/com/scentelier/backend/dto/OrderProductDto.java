package com.scentelier.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter @Setter @ToString
public class OrderProductDto {
    private Long cartItemId;
    private Long productId;
    private Long customId;
    private int quantity;
    private BigDecimal price;
}
