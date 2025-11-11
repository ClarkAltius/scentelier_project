package com.scentelier.backend.dto;

import com.scentelier.backend.constant.Category;
import com.scentelier.backend.constant.Season;

import java.math.BigDecimal;

public class ProductUpdateRequestDto {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;        // ★ 래퍼
    private String imageUrl;
    private Category category;
    private Season season;
    private String keyword;
    // getter/setter
}
