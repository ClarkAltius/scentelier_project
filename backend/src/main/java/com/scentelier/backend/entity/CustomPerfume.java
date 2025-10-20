package com.scentelier.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter @ToString
@Entity @Table(name = "custom_perfume")
public class CustomPerfume {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "custom_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users users;

    @NotBlank(message = "향수 이름을 정해주세요.")
    private String name;

    @NotBlank(message = "용량을 정해 주세요.")
    private int volume;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;

    @Column(name = "is_deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isDeleted = false;

    @Column(name = "deleted_at", columnDefinition = "DATETIME DEFAULT NULL")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deletedAt;

    @OneToMany(mappedBy = "customPerfume", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomPerfumeIngredient> customPerfumeIngredients;
}
