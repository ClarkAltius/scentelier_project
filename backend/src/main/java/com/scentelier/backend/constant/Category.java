package com.scentelier.backend.constant;

import lombok.Getter;

@Getter
public enum Category {
    ALL("전체"), CITRUS("시트러스"), FLORAL("플로럴"), WOODY("우디"), CHYPRE("시프레"), GREEN("그린"), FRUITY("프루티"), POWDERY("파우더리"), CRYSTAL("크리스탈");

    private final String description;

    Category(String description) {
        this.description = description;
    }

}
