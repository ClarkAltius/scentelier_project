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
        return reviews.map(this::convertToDto);
    }

    // 특정 상품 리뷰 조회
    public Page<ReviewDto> getReviewsByProduct(Long productId, Pageable pageable) {
        Page<Reviews> reviews = reviewRepository.findAllByProductId(productId, pageable);
        return reviews.map(this::convertToDto);
    }

    // DTO 변환
    private ReviewDto convertToDto(Orders order) {
        List<ReviewOrderProductDto> items = order.getOrderProducts().stream()
                .map(op -> new ReviewOrderProductDto(
                        op.getProducts().getId(),
                        op.getProducts().getName(),
                        op.getQuantity(),
                        op.getProducts().getPrice()
                ))
                .collect(Collectors.toList());

        return new ReviewDto(
                null,
                order.getId(),
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
                .map(op -> new ReviewOrderProductDto(
                        op.getProducts().getId(),
                        op.getProducts().getName(),
                        op.getQuantity(),
                        op.getProducts().getPrice()
                ))
                .collect(Collectors.toList());

        return new ReviewDto(
                review.getId(),
                order.getId(),
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
}
