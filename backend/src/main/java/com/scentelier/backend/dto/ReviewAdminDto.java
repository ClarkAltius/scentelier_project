package com.scentelier.backend.dto;

import com.scentelier.backend.entity.Reviews;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class ReviewAdminDto {
    private Long reviewId;
    private LocalDateTime createdAt;
    private String content; // We can truncate this in the service if needed
    private int rating;

    @JsonProperty("isDeleted")
    private boolean isDeleted;

    private Long orderId;
    private Long userId;
    private String username;
    private String userEmail;

    public ReviewAdminDto(Reviews review) {
        this.reviewId = review.getId();
        this.createdAt = review.getCreatedAt();
        this.content = review.getContent(); // Keep it full, truncate in frontend
        this.rating = review.getRating();
        this.isDeleted = review.isDeleted();

        this.orderId = review.getOrder().getId();
        this.userId = review.getUser().getId();
        this.username = review.getUser().getUsername();
        this.userEmail = review.getUser().getEmail();
    }
}