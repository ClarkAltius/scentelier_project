package com.scentelier.backend.service;

import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.CustomPerfumeRepository;
import com.scentelier.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomPerfumeService {
    private final CustomPerfumeRepository customPerfumeRepository;
    private final UserRepository userRepository;
    private final UserService userService;


    public Optional<CustomPerfume> findCustomPerfumeById(Long customId) {
        return customPerfumeRepository.findById(customId);
    }

    public List<CustomPerfume> findByUsers(Users users) {
        return customPerfumeRepository.findByUsersAndIsDeletedFalse(users);
    }

    @Transactional
    public String deleteCustomPerfume(Long userId, Long customId) {
        // 1. 사용자 조회
        Users user = userService.findUserById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. 향수 조회
        CustomPerfume customPerfume = customPerfumeRepository.findByIdAndUsers(customId, user)
                .orElseThrow(() -> new RuntimeException("향수를 찾을 수 없습니다."));

        // 3. isDeleted를 true로 변경
        customPerfume.setDeleted(true);

        // 4. DB 반영 (JPA가 @Transactional 덕분에 자동 업데이트)
        customPerfumeRepository.save(customPerfume);

        return "삭제 완료";
    }
}
