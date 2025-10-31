package com.scentelier.backend.controller;

import com.scentelier.backend.entity.Users;
import com.scentelier.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
}
