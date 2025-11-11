package com.scentelier.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDto {
    private String name;
    private String email;
    private String phone;
    private String address;

}
