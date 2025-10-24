package com.scentelier.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CartItemDto {
    private Long userId;
    private Long productId;
    private Long customId;
    private int quantity;
}
