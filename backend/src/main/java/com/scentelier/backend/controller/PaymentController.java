package com.scentelier.backend.controller;

import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.service.KakaoPayService;
import com.scentelier.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final KakaoPayService kakaoPayService;
    private final OrderService orderService;

    // 결제 준비 요청
    @PostMapping("/ready/{orderId}")
    public ResponseEntity<?> readyKakaoPay(@PathVariable Long orderId) {
        Orders order = orderService.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));
        Map<String, String> result = kakaoPayService.readyKakaoPay(order);
        return ResponseEntity.ok(result);
    }

    // 결제 성공
    @PutMapping("/success")
    public ResponseEntity<?> kakaoPaySuccess(@RequestParam Long orderId,
                                             @RequestParam String pgToken) {
        Map<String, Object> result = kakaoPayService.approveKakaoPay(orderId, pgToken);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/cancel")
    public ResponseEntity<?> kakaoPayCancel() {
        return ResponseEntity.badRequest().body("결제가 취소되었습니다.");
    }

    @GetMapping("/fail")
    public ResponseEntity<?> kakaoPayFail() {
        return ResponseEntity.badRequest().body("결제 중 오류가 발생했습니다.");
    }
}
