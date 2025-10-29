package com.scentelier.backend.dto;

import com.scentelier.backend.entity.InquiryAnswers;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InquiryAnswerRequestDto {
    @NotBlank(message = "답변 내용은 비어있을 수 없습니다.")
    private String content;
}
