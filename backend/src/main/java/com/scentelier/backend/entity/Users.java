package com.scentelier.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.scentelier.backend.constant.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @NotBlank(message = "이름은 필수 입력 사항입니다.")
    private String username;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "이메일은 필수 입력 사항입니다.")
    @Email
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력 사항입니다.")
    @Size(min = 8, max = 255, message = "비밀번호는 8자리 이상으로 입력해 주세요.")
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String address;

    private String phone;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;

    @Column(name = "is_deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isDeleted = false;

    @Column(name = "deleted_at", columnDefinition = "DATETIME DEFAULT NULL")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deletedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Carts carts;

}
