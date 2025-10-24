package com.scentelier.backend.dto;

import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.constant.Payment;
import com.scentelier.backend.entity.OrderProduct;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @ToString
public class OrderDto {
    private Long userId;
    private String recipientName;
    private String phone;
    private String address;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private Payment paymentMethod;
    private List<OrderProductDto> orderProducts;
}
