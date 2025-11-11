package com.scentelier.backend.controller;

import com.scentelier.backend.entity.Users;
import com.scentelier.backend.service.SignupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import com.scentelier.backend.constant.Role;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "http://localhost:3000") // React 프론트 허용
public class SignupController {

    @Autowired
    private SignupService signupService;

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String phone
//            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage // 프로필 이미지 넣기 추가

    ) {
        Users user = new Users();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setAddress(address);
        user.setPhone(phone);


        // 기본 역할(role) 지정
        user.setRole(Role.USER);


//        Map<String, String> result = signupService.registerUser(user, profileImage);
        Map<String, String> result = signupService.registerUser(user);
        
        if (result.containsKey("error")) {
            // 이메일 중복 등 오류 발생 시 400 Bad Request 반환
            return ResponseEntity.badRequest().body(result);
        }

        // 회원가입 성공 시 200 OK 반환
        return ResponseEntity.ok(result);
    }

//이메일 중복 확인
@GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = signupService.isEmailExists(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

}
