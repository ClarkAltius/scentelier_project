package com.scentelier.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewStatusUpdateDto {
    @NotNull
    private Boolean isDeleted;
}