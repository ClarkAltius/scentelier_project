package com.scentelier.backend.init;

import com.scentelier.backend.constant.Role;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.UserRepository;
import com.scentelier.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

//테스트 용 유저 데이터 생성


@Component
public class UserDataInitializer implements CommandLineRunner {

    //인젝션
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void run(String... args) throws Exception{
        System.out.println("유저 데이터 생성 시도");

        //관리자 생성
        //이메일 중복 체크 후 생성
        if(userRepository.findByEmail("admin@admin.com").isEmpty()){
            //중복이 아니면 생성
            Users admin = new Users();
            admin.setUsername("김관리자");
            admin.setEmail("admin@admin.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            admin.setAddress("관리구 관리동 관리로");
            admin.setPhone("010-0001-0001");
            admin.setCreatedAt(LocalDate.now());
            admin.setDeleted(false);
            userRepository.save(admin);
            System.out.println("관리자 계정 생성 완료");
        }else{
            System.out.println("해당 이메일 주소는 이미 사용중입니다.");
        }

        //일반 사용자 생성
        //이메일 중복 체크 후 생성
        if(userRepository.findByEmail("user@user.com").isEmpty()){
            //중복이 아니면 생성
            Users user = new Users();
            user.setUsername("박일반");
            user.setEmail("user@user.com");
            user.setPassword(passwordEncoder.encode("User@123"));
            user.setRole(Role.USER);
            user.setAddress("일반구 일반동 일반로");
            user.setPhone("010-0110-1000");
            user.setCreatedAt(LocalDate.now());
            user.setDeleted(false);
            userRepository.save(user);
            System.out.println("일반유저 생성 완료");
        }else{
            System.out.println("해당 이메일 주소는 이미 사용중입니다.");

        }
        System.out.println("유저 생성 과정 완료");
    }

}
