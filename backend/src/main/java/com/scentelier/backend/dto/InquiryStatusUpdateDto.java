package com.scentelier.backend.dto;

import com.scentelier.backend.constant.InquiryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InquiryStatusUpdateDto {

    @NotNull(message = "Status cannot be null")
    private InquiryStatus status;
}