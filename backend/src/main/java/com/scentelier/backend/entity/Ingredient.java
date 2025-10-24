package com.scentelier.backend.entity;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@ToString
@Entity
@Table(name = "ingredient")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ingredient_id")
    private Long id;

    @Column(nullable = false)//값입력필수
    private String name;

    @Column(nullable = false,length = 1000)//값입력필수
    @NotBlank(message = "상품설명은 필수입력 사항입니다.")
    @Size(max = 1000, message = "상품에 대한 설명은 최대 1000자리 이하로 입력해주세요")
    private String  description;

    @Column(nullable = false)//값입력필수
    private BigDecimal stock;

    @Column(name = "is_deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isDeleted;

    @Column(name = "deleted_at", columnDefinition = "DATETIME DEFAULT NULL")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deletedAt;

    @Column(name = "img_url")
    @NotBlank(message = "이미지는 필수입력 사항입니다.")
    private String imgUrl ;

}