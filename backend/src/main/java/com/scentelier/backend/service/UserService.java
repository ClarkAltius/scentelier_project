package com.scentelier.backend.service;

import com.scentelier.backend.constant.Role;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class UserService {

    //inject UserRepository
    @Autowired
    private UserRepository userRepository;

    //Inject Encoder
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Users registerUser(Users newUser){
        //저장 전 패스워드 인코딩
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        //디폴트 역할 설정
        newUser.setRole(Role.USER);
        return userRepository.save(newUser);
    }

    public Optional<Users> findUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public Optional<Users> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    //유저 검색 업데이트 예정

    // 사용자 정보 저장/수정 by 마이페이지
    public Users saveUser(Users user) {
        return userRepository.save(user);
    }

    //탈퇴 코드
    // 논리 삭제
    public boolean deleteUser(String email) {
        Optional<Users> optionalUser = userRepository.findByEmail(email);
        if(optionalUser.isPresent()){
            Users user = optionalUser.get();
            user.setDeleted(true);
            user.setDeletedAt(LocalDate.now());
            userRepository.save(user);
            return true;
        }
        return false; // 이미 삭제되었거나 존재하지 않는 사용자
    }

    //비밀번호 찾기
    public Users resetPassword(String name, String email, String phone, String newPassword) {
        Optional<Users> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            throw new NoSuchElementException("해당 이메일의 사용자가 존재하지 않습니다.");
        }

        Users user = optionalUser.get();

        // 이름 + 전화번호 일치 여부 검증
        if (!user.getUsername().equals(name) || !user.getPhone().equals(phone)) {
            throw new IllegalArgumentException("입력한 정보가 일치하지 않습니다.");
        }

        // 새 비밀번호 인코딩 후 저장
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }// 비밀번호 찾기 끝
}
