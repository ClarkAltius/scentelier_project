package com.scentelier.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.scentelier.backend.constant.ProductStatus;
import com.scentelier.backend.constant.Season;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "products")
public class Products {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @NotBlank(message = "상품 이름은 필수 입력 사항입니다.")
    private String name;

    private String description;

    @NotNull(message = "가격은 비어 있을 수 없습니다.")
    @DecimalMin(value = "0.0", inclusive = false, message = "가격은 0보다 커야 합니다.")
    private BigDecimal price;

    @Column(columnDefinition = "INT DEFAULT 0")
    private int stock;


    private String category;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private Season season;

    private String keyword;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;

    @Column(name = "is_deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isDeleted = false;

    @Column(name = "deleted_at", columnDefinition = "DATETIME DEFAULT NULL")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deletedAt;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.SELLING;
}

