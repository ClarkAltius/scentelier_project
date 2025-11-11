package com.scentelier.backend.controller;

import com.scentelier.backend.dto.UpdateUserDto;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.UserRepository;
import com.scentelier.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder,UserRepository userRepository) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
     }

    // 프로필 이미지 다운로드
    @GetMapping("/profile-image")
    public ResponseEntity<Resource> getProfileImage(@RequestParam String email) throws IOException {
        String imagePath = userService.getProfileImagePath(email); // DB에서 이미지 파일명 가져오기
        Path filePath = Paths.get("src/main/uploads/profile").resolve(imagePath).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // 필요하면 파일 확장자에 따라 contentType 변경
                .body(resource);
    }


    // 회원 정보 수정
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UpdateUserDto updateUserDto) throws IOException {
        Optional<Users> optionalUser = userService.findByEmail(updateUserDto.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("사용자를 찾을 수 없습니다.");
        }

        Users user = optionalUser.get();
        user.setUsername(updateUserDto.getName());
        user.setPhone(updateUserDto.getPhone());
        user.setAddress(updateUserDto.getAddress());

        userService.saveUser(user);
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
    @PostMapping(value = "/reset-password",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<?> resetPassword(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam(required = false) String newPassword
    ) {
        try {
            Users user = userService.findByEmail(email)
                    .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

            if (!user.getUsername().equals(name) || !user.getPhone().equals(phone)) {
                throw new IllegalArgumentException("입력한 정보가 일치하지 않습니다.");
            }

            // newPassword가 null이 아니면 비밀번호 변경
            if (newPassword != null && !newPassword.isBlank()) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userService.saveUser(user);
                return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
            }

            // 정보 확인만 하고 싶으면 OK 반환
            return ResponseEntity.ok("사용자 정보가 확인되었습니다.");

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body("해당 이메일의 사용자를 찾을 수 없습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("서버 오류가 발생했습니다.");
        }
    }

    //비밀번호 찾기 끝

//마이페이지 비밀번호 변경
    @PostMapping(value = "/change-password", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<?> changePassword(
            @RequestParam String email,
            @RequestParam String currentPassword,
            @RequestParam String newPassword
    ) {
        Optional<Users> optionalUser = userService.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("사용자를 찾을 수 없습니다.");
        }

        Users user = optionalUser.get();

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(400).body("현재 비밀번호가 틀렸습니다.");
        }

        // 새 비밀번호 저장
        user.setPassword(passwordEncoder.encode(newPassword));
        userService.saveUser(user);

        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }
    //마이페이지 비밀번호 변경 끝

    // 프로필 이미지 조회 로직
    @GetMapping("/profile/{userId}")
    public ResponseEntity<Resource> getProfileImageById(@PathVariable Long userId) throws IOException {
        Optional<Users> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        // 업로드된 프로필 이미지 경로
        Path filePath = Paths.get("src/main/uploads/profile")
                .resolve(userId + ".jpg")
                .normalize();

        Resource resource;
        if (Files.exists(filePath) && Files.isReadable(filePath)) {
            resource = new UrlResource(filePath.toUri());
        } else {
            // 파일 없으면 default.png 반환
            Path defaultPath = Paths.get("src/main/uploads/profile/default.png").normalize();
            resource = new UrlResource(defaultPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Default image not found");
            }
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // 사용자 프로필 업로드 로직
    @PostMapping("/profile/upload/{userId}")
    public ResponseEntity<String> uploadProfile(@PathVariable Long userId,
                                                @RequestParam MultipartFile file) {
        try {
            // 프로젝트 기준 경로 (src/main/resources는 개발용)
            String folderPath = new File("src/main/uploads/profile").getAbsolutePath();
            File folder = new File(folderPath);
            if (!folder.exists()) {
                folder.mkdirs(); // 디렉토리 없으면 생성
            }

            // 파일 이름은 userId 기반

            String filename = userId + ".jpg";
            File destination = new File(folder, filename);

            file.transferTo(destination);

            return ResponseEntity.ok("업로드 성공: " + destination.getPath());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업로드 실패");
        }
    }


}