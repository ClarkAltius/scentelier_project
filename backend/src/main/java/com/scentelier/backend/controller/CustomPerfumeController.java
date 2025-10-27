package com.scentelier.backend.controller;

import com.scentelier.backend.entity.CustomPerfumeIngredient;
import com.scentelier.backend.service.CustomPerfumeIngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customPerfume/ingredients")
@RequiredArgsConstructor
public class CustomPerfumeController {
    private final CustomPerfumeIngredientService CustomPerfumeIngredientService;


}
