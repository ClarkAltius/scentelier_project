package com.scentelier.backend.controller;

import com.scentelier.backend.Embeddable.CustomPerfumeIngredientId;
import com.scentelier.backend.constant.Note;
import com.scentelier.backend.dto.*;
import com.scentelier.backend.entity.*;
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
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customPerfume")
@RequiredArgsConstructor
public class CustomPerfumeController {
    private final CustomPerfumeIngredientService CustomPerfumeIngredientService;
    private final CustomPerfumeService customPerfumeService;
    private final CustomPerfumeRepository customPerfumeRepository;
    private  final UserRepository userRepository;
    private  final UserService userService;
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

    @GetMapping("/myPerfume/{userId}")
    public ResponseEntity<List<CustomPerfumeDTO>> getCustomPerfume(@PathVariable Long userId) {
        Optional<Users> optionalUsers = userService.findUserById(userId);
        if (optionalUsers.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Users users = optionalUsers.get();
        List<CustomPerfume> customPerfumes = customPerfumeService.findByUsers(users);

        List<CustomPerfumeDTO> dtoList = customPerfumes.stream()
                .map(CustomPerfumeDTO::new)
                .collect(Collectors.toList());

        System.out.println(dtoList);
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteCustomPerfume(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Long customId = Long.valueOf(payload.get("customId").toString());

            String result = customPerfumeService.deleteCustomPerfume(userId, customId);
            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("잘못된 요청입니다.");
        }
    }
}
