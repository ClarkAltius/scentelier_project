package com.scentelier.backend.controller;

import com.scentelier.backend.dto.ReviewCreateDto;
import com.scentelier.backend.dto.ReviewDto;
import com.scentelier.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    // 작성 가능한 주문 리스트
    @GetMapping("/unwritten/{userId}")
    public ResponseEntity<?> getUnwrittenOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getUnwrittenOrders(userId));
    }

    // 리뷰 작성
    @PostMapping("/write/{userId}")
    public ResponseEntity<?> createReview(@PathVariable Long userId, @RequestBody ReviewCreateDto dto) {
        try {
            ReviewDto result = reviewService.createReview(userId, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 작성된 리뷰 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }
}

