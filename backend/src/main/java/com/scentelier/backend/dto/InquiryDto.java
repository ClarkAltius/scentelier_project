package com.scentelier.backend.dto;

import com.scentelier.backend.constant.Type;
import com.scentelier.backend.entity.Inquiry;
import com.scentelier.backend.constant.InquiryStatus;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import java.text.DateFormat;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor @NoArgsConstructor
public class InquiryDto {
    private Long id;
    private String username;
    private String content;
    private String userEmail;
    private String title;
    private String type;
    private LocalDateTime createdAt;
    private InquiryStatus status;
    private Products productId;
    private List<InquiryAnswerResponseDto> answers;

    public InquiryDto(Inquiry inquiry) {
        this.id = inquiry.getId();
        this.title = inquiry.getTitle();
        this.createdAt = inquiry.getCreatedAt();
        this.content = inquiry.getContent();

        // null 일 경우 고정값 반환
        Users user = inquiry.getUser();
        this.username = (user != null) ? user.getUsername() : "Unknown User";
        this.userEmail = (user != null) ? user.getEmail() : "Unknown Email";
        this.type = (inquiry.getType() != null) ? inquiry.getType().name() : "OTHER";
        this.status = (inquiry.getStatus() != null) ? inquiry.getStatus() : InquiryStatus.PENDING;
    }
}