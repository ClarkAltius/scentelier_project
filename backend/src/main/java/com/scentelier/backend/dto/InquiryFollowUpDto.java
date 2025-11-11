package com.scentelier.backend.dto;

import com.scentelier.backend.constant.Role; // We need this
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InquiryFollowUpDto {

    private Long id;
    private String message;
    private LocalDateTime createdAt;

    // Simple name to display
    private String authorName;

    // So the UI can check: authorRole === 'ADMIN' ?
    private Role authorRole;
}
