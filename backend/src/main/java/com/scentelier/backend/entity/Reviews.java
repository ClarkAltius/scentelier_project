package com.scentelier.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
@Entity @Table(name="reviews")
public class Reviews {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="review_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id", nullable = false)
    private Products product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable = false)
    private Users user;

    @NotBlank(message = "리뷰 내용은 필수 입력사항입니다")
    private String content;

    @NotNull
    @Min(value = 1, message = "최소 별점은 1입니다")
    @Max(value = 5, message = "최대 별점은 5입니다")
    private double rating;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDateTime createdAt;

    @Column(name = "is_deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isDeleted = false;

    @Column(name = "deleted_at", columnDefinition = "DATETIME DEFAULT NULL")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deletedAt;
}

