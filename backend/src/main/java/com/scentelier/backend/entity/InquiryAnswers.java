package com.scentelier.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "inquiry_answer")
public class InquiryAnswers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Long id;

    @NotNull(message = "문의 번호는 필수 입력 사항입니다")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id")
    private Inquiry inquiry;

    @NotBlank(message = "답변 내용은 필수 입력 사항입니다")
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @NotNull(message = "사용자 ID는 필수 입력사항입니다")
    @ManyToOne(fetch = FetchType.LAZY) //한 유저가 여러 답변 생성 가능 (admin)
    @JoinColumn(name = "user_id")
    private Users user;
}
