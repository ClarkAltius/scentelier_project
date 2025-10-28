package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CustomPerfumeResponseDto {
    private Long id;
    private String name;
    private int volume;
    private String createdAt;
}
