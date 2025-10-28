package com.scentelier.backend.controller;

import com.scentelier.backend.Embeddable.CustomPerfumeIngredientId;
import com.scentelier.backend.constant.Note;
import com.scentelier.backend.dto.CustomPerfumeInfoDto;
import com.scentelier.backend.dto.CustomPerfumeRequestDto;
import com.scentelier.backend.dto.CustomPerfumeResponseDto;
import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.CustomPerfumeIngredient;
import com.scentelier.backend.entity.Ingredient;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.CustomPerfumeRepository;
import com.scentelier.backend.repository.IngredientRepository;
import com.scentelier.backend.repository.UserRepository;
import com.scentelier.backend.service.CustomPerfumeIngredientService;
import com.scentelier.backend.service.CustomPerfumeService;
import com.scentelier.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customPerfume")
@RequiredArgsConstructor
public class CustomPerfumeController {
    private final CustomPerfumeIngredientService CustomPerfumeIngredientService;
    private final CustomPerfumeRepository customPerfumeRepository;
    private  final UserRepository userRepository;
    private  final IngredientRepository ingredientRepository;

    @PostMapping("/addCustom")
    public ResponseEntity<?> createCustomPerfume(
            @Valid @RequestBody CustomPerfumeRequestDto request,
            BindingResult bindingResult) {

        // 1️⃣ 유효성 검사
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldError().getDefaultMessage();
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }

        // 2️⃣ 사용자 조회
        Users user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3️⃣ CustomPerfume 엔티티 생성
        CustomPerfume perfume = new CustomPerfume();
        perfume.setUsers(user);
        perfume.setName(request.getName());
        perfume.setVolume(request.getVolume());

        // 4️⃣ CustomPerfumeIngredient 생성
        List<CustomPerfumeIngredient> ingredients = request.getCustomPerfumeInfoDto()
                .stream()
                .map(dto -> {
                    Ingredient ingredientEntity = ingredientRepository.findById(dto.getIngredientId())
                            .orElseThrow(() -> new RuntimeException("Ingredient not found with id " + dto.getIngredientId()));

                    CustomPerfumeIngredient ingredient = new CustomPerfumeIngredient();
                    ingredient.setCustomPerfume(perfume);       // CustomPerfume 연관
                    ingredient.setIngredients(ingredientEntity); // Ingredient 연관
                    ingredient.setNoteType(dto.getNoteType());
                    ingredient.setAmount(dto.getAmount());

                    return ingredient;
                })
                .toList();

        perfume.setCustomPerfumeIngredients(ingredients);

        // 5️⃣ 저장 (cascade = ALL 이면 ingredient도 자동 저장)
        CustomPerfume savedPerfume = customPerfumeRepository.save(perfume);

        // 6️⃣ Response DTO 생성
        CustomPerfumeResponseDto response = new CustomPerfumeResponseDto(
                savedPerfume.getId(),
                savedPerfume.getName(),
                savedPerfume.getVolume(),
                savedPerfume.getCreatedAt().toString()
        );

        return ResponseEntity.ok(response);
    }



    //-----------------------------------------------------------------

    public ResponseEntity<?> customPerfumeInfo(){


        return null;
    }
}
