package com.scentelier.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
@Entity @Table(name="cart_item")
public class CartItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="cart_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="cart_id")
    private Carts cart;

    @NotNull(message = "장바구니 품목 수량은 0일 수 없습니다")
    private Long quantity;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id", nullable = true)
    private Products product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="custom_id", nullable = true)
    private CustomPerfume customPerfume;

}
