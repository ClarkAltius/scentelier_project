package com.scentelier.backend.service;

import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class SignupService {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 비밀번호 패턴: 첫 글자 대문자 + 8자 이상
    private static final String PASSWORD_PATTERN = "^[A-Z][A-Za-z0-9!@#$%^&*]{7,}$";
    private static final String PHONE_PATTERN = "^\\d{2,3}-\\d{3,4}-\\d{4}$";

    // 이미지 업로드 경로
   // private static final String UPLOAD_DIR = "src/main/uploads/profile/";

    public Map<String, String> registerUser(Users user) {
        Map<String, String> response = new HashMap<>();


        // 이메일 중복 체크
        Optional<Users> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            response.put("error", "이미 존재하는 이메일입니다.");
            return response;
        }


        // 비밀번호 유효성 검사
        if (!user.getPassword().matches(PASSWORD_PATTERN)) {
            response.put("error", "비밀번호는 첫 글자가 대문자이고 8자 이상이어야 합니다.");
            return response;
        }

        // 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 전화번호 필수 검사
        if (user.getPhone() == null || user.getPhone().isEmpty()) {
            response.put("error", "전화번호는 필수 입력 항목입니다.");
            return response;
        }
        if (!user.getPhone().matches(PHONE_PATTERN)) {
            response.put("error", "전화번호 형식이 올바르지 않습니다. 000-0000-0000 형식으로 입력해 주세요.");
            return response;
        }

        // 프로필 이미지 처리
//        try {
//            String fileName;
//
//            if (profileImage != null && !profileImage.isEmpty()) {
//                // 이미지 업로드 처리
//                fileName = System.currentTimeMillis() + "_" + profileImage.getOriginalFilename();
//
//                Path uploadPath = Paths.get(UPLOAD_DIR);
//                if (!Files.exists(uploadPath)) {
//                    Files.createDirectories(uploadPath);
//                }
//
//                Path filePath = uploadPath.resolve(fileName);
//                Files.copy(profileImage.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
//
//            } else {
//                // 기본 이미지 지정
//                fileName = "default.png";
//            }
//
//            user.setProfileImage(fileName);
//
//        } catch (IOException e) {
//            response.put("error", "이미지 업로드 중 오류가 발생했습니다.");
//            return response;
//        }
//프로필 이미지 처리 끝

        //사용자 저장
        userRepository.save(user);
        response.put("message", "회원가입 성공");
        return response;
    }
    //프로필 이미지 처리 끝

//이메일 중복 체크
    public boolean isEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    } // 이메일 중복 체크 끝
}
