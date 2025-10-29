package com.scentelier.backend.dto;

import com.scentelier.backend.entity.InquiryAnswers;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InquiryAnswerResponseDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private String adminUsername;

    public InquiryAnswerResponseDto(InquiryAnswers answer) {
        this.id = answer.getId();
        this.content = answer.getContent();
        this.createdAt = answer.getCreatedAt();
        if (answer.getUser() != null) {
            this.adminUsername = answer.getUser().getUsername();
        } else {
            this.adminUsername = "Admin"; // Fallback
        }
    }
}