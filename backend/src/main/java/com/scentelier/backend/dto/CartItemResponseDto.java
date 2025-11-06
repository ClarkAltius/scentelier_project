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
            int volume = 0;
            if (cartItems.getCustomPerfume().getVolume() > 0) {
                volume = cartItems.getCustomPerfume().getVolume();
            }

            switch (volume) {
                case 30:
                    this.price = BigDecimal.valueOf(50000);
                    break;
                case 50:
                    this.price = BigDecimal.valueOf(70000);
                    break;
                case 100:
                    this.price = BigDecimal.valueOf(100000);
                    break;
                default:
                    this.price = BigDecimal.valueOf(50000); // 기본값
            }
        }

        this.quantity = cartItems.getQuantity();
    }
}
