package com.scentelier.backend.controller;

import com.scentelier.backend.dto.ReviewCreateDto;
import com.scentelier.backend.dto.ReviewDto;
import com.scentelier.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // 사용자가 쓴 리뷰 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ReviewDto>> getUserReviews(@PathVariable Long userId, Pageable pageable) {
        return ResponseEntity.ok(reviewService.getUserReviewsPaged(userId, pageable));
    }

    // 전체 리뷰 조회
    @GetMapping("/all")
    public ResponseEntity<Page<ReviewDto>> getAllReviews(Pageable pageable) {
        return ResponseEntity.ok(reviewService.getAllReviews(pageable));
    }

    // 특정 상품 리뷰 조회
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewDto>> getReviewsByProduct(
            @PathVariable Long productId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId, pageable));
    }

    @PutMapping("/update/{reviewId}")
    public ResponseEntity<?> updateReview(@PathVariable Long reviewId, @RequestBody ReviewCreateDto dto) {
        try {
            ReviewDto result = reviewService.updateReview(reviewId, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/delete/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        try {
            ReviewDto result = reviewService.deleteReview(reviewId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

