package com.scentelier.backend.controller;

import com.scentelier.backend.entity.Users;
import com.scentelier.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;


import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;

     }

    // 회원 정보 수정
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String address
    ) {
        Optional<Users> optionalUser = userService.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("사용자를 찾을 수 없습니다.");
        }

        Users user = optionalUser.get();
        user.setUsername(name);
        user.setPhone(phone);
        user.setAddress(address);

        userService.saveUser(user); // DB에 저장
        // 업데이트된 사용자 객체를 그대로 반환
        return ResponseEntity.ok(user);
    }


    // 회원 탈퇴
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser(@RequestParam String email, HttpServletRequest request){
        boolean deleted = userService.deleteUser(email);
        if(deleted){
            request.getSession().invalidate(); // 세션 기반 로그아웃
            return ResponseEntity.ok("회원 탈퇴 완료되었습니다.");
        } else {
            return ResponseEntity.status(404).body("해당 사용자를 찾을 수 없습니다.");
        }
    }


    //비밀번호 찾기
//    @PostMapping("/reset-password")
//    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> requestData) {
//        String name = requestData.get("name");
//        String email = requestData.get("email");
//        String phone = requestData.get("phone");
//        String newPassword = requestData.get("newPassword");
//
//        try {
//            Users updatedUser = userService.resetPassword(name, email, phone, newPassword);
//            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
//        } catch (NoSuchElementException e) {
//            return ResponseEntity.status(404).body("해당 이메일의 사용자를 찾을 수 없습니다.");
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.status(400).body("입력한 정보가 일치하지 않습니다.");
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("서버 오류가 발생했습니다.");
//        }
//    }
    @PostMapping(value = "/reset-password",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<?> resetPassword(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String newPassword
    ) {
        try {
            Users updatedUser = userService.resetPassword(name, email, phone, newPassword);
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body("해당 이메일의 사용자를 찾을 수 없습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("입력한 정보가 일치하지 않습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("서버 오류가 발생했습니다.");
        }
    }

    //비밀번호 찾기 끝

}