package com.scentelier.backend.dto;

import com.scentelier.backend.entity.CustomPerfumeIngredient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CustomPerfumeRequestDto {
    @NotNull(message = "유저 ID는 필수입니다.")
    private Long userId;

    @NotBlank(message = "향수 이름을 입력하세요.")
    private String name;

    @NotNull(message = "용량을 선택해주세요.")
    @Positive(message = "용량은 양수여야 합니다.")
    private Integer volume;

    @NotNull(message = "커스텀 정보가 없습니다.")
    private List<CustomPerfumeInfoDto> customPerfumeInfoDto;

}
