package com.scentelier.backend.service;

import com.scentelier.backend.dto.OrderResponseDto;
import com.scentelier.backend.dto.ReviewCreateDto;
import com.scentelier.backend.dto.ReviewDto;
import com.scentelier.backend.dto.ReviewOrderProductDto;
import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.entity.Reviews;
import com.scentelier.backend.repository.OrderRepository;
import com.scentelier.backend.repository.ReviewRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository; // 주문 정보 조회용

    // 작성 가능한 주문 리스트
    public List<ReviewDto> getUnwrittenOrders(Long userId) {
        List<Orders> orders = reviewRepository.findUnwrittenOrdersEntities(userId);

        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    // 리뷰 작성
    @Transactional
    public ReviewDto createReview(Long userId, ReviewCreateDto dto) {
        Orders order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

        // 이미 리뷰 존재 확인
        if (reviewRepository.findByOrder(order).isPresent()) {
            throw new RuntimeException("이미 리뷰가 작성된 주문입니다.");
        }

        Reviews review = new Reviews();
        review.setOrder(order);
        review.setUser(order.getUsers()); // 주문한 사용자
        review.setContent(dto.getContent());
        review.setRating(dto.getRating());

        review = reviewRepository.save(review);
        return convertToDto(review);
    }

    // 사용자 리뷰 조회
    public Page<ReviewDto> getUserReviewsPaged(Long userId, Pageable pageable) {
        Page<Reviews> reviews = reviewRepository.findAllByUserIdPaged(userId, pageable);
        return reviews.map(this::convertToDto);
    }

    // 전체 리뷰 조회
    public Page<ReviewDto> getAllReviews(Pageable pageable) {
        Page<Reviews> reviews = reviewRepository.findAllByIsDeletedFalse(pageable);
        return reviews.map(this::convertToBlockDto);
    }

    // 특정 상품 리뷰 조회
    public Page<ReviewDto> getReviewsByProduct(Long productId, Pageable pageable) {
        Page<Reviews> reviews = reviewRepository.findAllByProductId(productId, pageable);
        return reviews.map(this::convertToBlockDto);
    }

    // 리뷰 수정
    public ReviewDto updateReview(Long reviewId, ReviewCreateDto dto) {
        Reviews review = reviewRepository.findById(reviewId).orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        review.setContent(dto.getContent());
        review.setRating(dto.getRating());
        review = reviewRepository.save(review);
        return convertToDto(review);
    }

    // 리뷰 삭제
    public ReviewDto deleteReview(Long reviewId) {
        Reviews review = reviewRepository.findById(reviewId).orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        review.setDeleted(true);
        review = reviewRepository.save(review);
        return convertToDto(review);
    }

    // DTO 변환
    private ReviewDto convertToDto(Orders order) {
        List<ReviewOrderProductDto> items = order.getOrderProducts().stream()
                .map(op -> {
                    if (op.getProducts() != null) {
                        return new ReviewOrderProductDto(
                                op.getProducts().getId(),
                                op.getProducts().getName(),
                                op.getQuantity(),
                                op.getProducts().getPrice()
                        );
                    } else if (op.getCustomPerfume() != null) {
                        return new ReviewOrderProductDto(
                                op.getCustomPerfume().getId(),
                                op.getCustomPerfume().getName(),
                                op.getQuantity(),
                                op.getPrice()
                        );
                    } else {
                        throw new IllegalStateException("OrderProduct에 상품 정보가 없습니다. (order_product_id: " + op.getId() + ")");
                    }
                })
                .collect(Collectors.toList());

        return new ReviewDto(
                null,
                order.getId(),
                null,
                null,
                0,
                null,
                order.getRecipientName(),
                order.getAddress(),
                order.getTotalPrice(),
                order.getTrackingNumber(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                items
        );
    }

    private ReviewDto convertToDto(Reviews review) {
        Orders order = review.getOrder();
        List<ReviewOrderProductDto> items = order.getOrderProducts().stream()
                .map(op -> {
                    if (op.getProducts() != null) {
                        return new ReviewOrderProductDto(
                                op.getProducts().getId(),
                                op.getProducts().getName(),
                                op.getQuantity(),
                                op.getProducts().getPrice()
                        );
                    } else if (op.getCustomPerfume() != null) {
                        return new ReviewOrderProductDto(
                                op.getCustomPerfume().getId(),
                                op.getCustomPerfume().getName(),
                                op.getQuantity(),
                                op.getPrice()
                        );
                    } else {
                        throw new IllegalStateException("OrderProduct에 상품 정보가 없습니다. (order_product_id: " + op.getId() + ")");
                    }
                })
                .collect(Collectors.toList());

        return new ReviewDto(
                review.getId(),
                order.getId(),
                maskUsingRegex(order.getUsers().getUsername(), "*"),
                review.getContent(),
                review.getRating(),
                review.getCreatedAt(),
                order.getRecipientName(),
                order.getAddress(),
                order.getTotalPrice(),
                order.getTrackingNumber(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                items
        );
    }

    private ReviewDto convertToBlockDto(Reviews review) {
        Orders order = review.getOrder();
        List<ReviewOrderProductDto> items = order.getOrderProducts().stream()
                .map(op -> {
                    if (op.getProducts() != null) {
                        return new ReviewOrderProductDto(
                                op.getProducts().getId(),
                                op.getProducts().getName(),
                                op.getQuantity(),
                                op.getProducts().getPrice()
                        );
                    } else if (op.getCustomPerfume() != null) {
                        return new ReviewOrderProductDto(
                                op.getCustomPerfume().getId(),
                                op.getCustomPerfume().getName(),
                                op.getQuantity(),
                                op.getPrice()
                        );
                    } else {
                        throw new IllegalStateException("OrderProduct에 상품 정보가 없습니다. (order_product_id: " + op.getId() + ")");
                    }
                })
                .collect(Collectors.toList());

        return new ReviewDto(
                review.getId(),
                order.getId(),
                maskUsingRegex(order.getUsers().getUsername(), "*"),
                review.getContent(),
                review.getRating(),
                review.getCreatedAt(),
                null,
                null,
                order.getTotalPrice(),
                null,
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                items
        );
    }

    // 첫 글자를 제외한 나머지 글자를 모두 마스킹 처리
    public static String maskUsingRegex(String text, String maskChar) {
        if (text == null || text.length() < 2) {
            return text;
        }
        return text.replaceAll("(?<=.{1}).", maskChar);
    }
}
