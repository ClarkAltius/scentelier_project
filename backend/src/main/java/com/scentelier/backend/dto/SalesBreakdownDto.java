package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesBreakdownDto {
    private long finishedPerfumes;
    private long customPerfumes;
}