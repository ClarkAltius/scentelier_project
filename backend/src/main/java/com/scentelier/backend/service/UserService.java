package com.scentelier.backend.service;

import com.scentelier.backend.constant.Role;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    //유저 검색, 비밀번호 수정 업데이트 예정


}
