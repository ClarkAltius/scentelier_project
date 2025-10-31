package com.scentelier.backend.service;

import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired //inject UserRepository
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        //유저를 이메일 주소로 검색
        Optional<Users> usersOptional = userRepository.findByEmail(email);

        if(usersOptional.isEmpty()){
         throw new UsernameNotFoundException("이메일 혹은 비밀번호가 틀렸습니다.");
        }

        Users user = usersOptional.get();

        // 탈퇴한 사용자면 로그인 불가
        if (user.isDeleted()) {
            throw new UsernameNotFoundException("탈퇴된 사용자입니다.");
        }

        //역할군 생성
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        //Spring Security 유저 객체 반환
        return new User(user.getEmail(), user.getPassword(), authorities);

    }
}
