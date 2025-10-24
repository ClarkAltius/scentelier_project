package com.scentelier.backend.dto;

import com.scentelier.backend.entity.CartItems;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class CartItemResponseDto {
    private Long cartItemId;
    private Long productId;
    private Long customId;
    private String name;
    private String imageUrl;
    private BigDecimal price;
    private int quantity;
    private boolean checked = false;

    public CartItemResponseDto(CartItems cartItems) {
        this.cartItemId = cartItems.getId();

        if (cartItems.getProduct() != null) {
            this.productId = cartItems.getProduct().getId();
            this.name = cartItems.getProduct().getName();
            this.imageUrl = cartItems.getProduct().getImageUrl();
            this.price = cartItems.getProduct().getPrice();
        }
        else if (cartItems.getCustomPerfume() != null) {
            this.customId = cartItems.getCustomPerfume().getId();
            this.name = cartItems.getCustomPerfume().getName();
            this.imageUrl = null;
            this.price = BigDecimal.valueOf(50000);
        }

        this.quantity = cartItems.getQuantity();
    }
}
