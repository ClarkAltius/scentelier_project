package com.scentelier.backend.event;

import com.scentelier.backend.entity.Orders;
import lombok.Getter;

// 주문 취소시 제품 수량 수정용 이벤트.
@Getter
public class OrderCancelledEvent {

    private final Orders cancelledOrder;

    public OrderCancelledEvent(Orders cancelledOrder) {
        this.cancelledOrder = cancelledOrder;
    }
}