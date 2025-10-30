package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BestSellerDto {
    private Integer id; // Product ID
    private String name;
    private long sales; // Using long for "sold" count, as it could grow
}