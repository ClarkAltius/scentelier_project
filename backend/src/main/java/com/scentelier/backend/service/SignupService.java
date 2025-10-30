package com.scentelier.backend.service;

import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class SignupService {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Map<String, String> registerUser(Users user) {
        Map<String, String> response = new HashMap<>();


        // 이메일 중복 체크
        Optional<Users> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            response.put("error", "이미 존재하는 이메일입니다.");
            return response;
        }

        // 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        response.put("message", "회원가입 성공");
        return response;
    }
}