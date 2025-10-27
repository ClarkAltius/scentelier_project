package com.scentelier.backend.controller;

import com.scentelier.backend.dto.PerfumeNoteDto;
import com.scentelier.backend.entity.Ingredient;
import com.scentelier.backend.entity.PerfumeTypeRecommendation;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.service.IngredientService;
import com.scentelier.backend.service.PerfumeTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/perfume")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PerfumeTypeController {

    private final PerfumeTypeService service;
    private final IngredientService ingredientService;


    @GetMapping("/type")
    public List<PerfumeNoteDto> getNotes(@RequestParam String type) {
        return service.getNotesByType(type);
    }

    @GetMapping("/list")
    public List<Ingredient> getlist() {
        List<Ingredient> ingredientList = ingredientService.findAll();
        return ingredientList;
    }
}
