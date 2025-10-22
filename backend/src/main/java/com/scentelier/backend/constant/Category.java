package com.scentelier.backend.constant;

import lombok.Getter;

@Getter
public enum Category {
    ALL("전체"), CITRUS("시트러스"), FLORAL("플로럴"), WOODY("우디"), CHYPRE("시프레"), GREEN("그린"), FOUGERE("푸제르"), ORIENTAL("오리엔탈"), AMBER("앰버");

    private final String description;

    Category(String description) {
        this.description = description;
    }

}
