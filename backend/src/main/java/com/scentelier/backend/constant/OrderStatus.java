package com.scentelier.backend.constant;


public enum OrderStatus {
    // PENDING 보류, PAID 지불완료, SHIPPED 배송중, DELIVERED 배달완료, CANCELLED 주문취소
    PENDING, PAID, SHIPPED, DELIVERED, PAYMENT_PENDING, PROCESSING, CREATED, CANCELLED
}
