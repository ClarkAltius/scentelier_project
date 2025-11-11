package com.scentelier.backend.service;

import com.scentelier.backend.constant.Role;
import com.scentelier.backend.dto.UserAdminDto;
import com.scentelier.backend.dto.UserAdminUpdateDto;
import com.scentelier.backend.dto.UserStatusUpdateDto;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.NoSuchElementException;
import java.util.Optional;

import com.scentelier.backend.constant.Role;
import org.springframework.data.domain.PageImpl;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import java.sql.Date;
import java.sql.Timestamp;

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

    // ===== 관리자 유저관리창 시작 =====
    @Transactional(readOnly = true)
    public Page<UserAdminDto> getUsers(Pageable pageable, String search, String status) {
        String statusFilter = (status != null && status.isEmpty()) ? null : status;

        // This now returns Page<Object[]>
        Page<Object[]> results = userRepository.findUsersWithStats(pageable, search, statusFilter);

        // Manually map the results to a DTO list
        List<UserAdminDto> dtoList = results.getContent().stream()
                .map(this::mapObjectArrayToUserAdminDto)
                .collect(Collectors.toList());

        // Return a new Page object with the DTOs
        return new PageImpl<>(dtoList, results.getPageable(), results.getTotalElements());
    }

    @Transactional(readOnly = true)
    public UserAdminDto getUserDetail(Long id) {// 1. This returns a 1-element array containing our data array: [[data...]]
        Object[] resultWrapper = userRepository.findUserWithStatsById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        // 2. We extract the *actual* 10-element data array from index 0
        Object[] actualDataRow = (Object[]) resultWrapper[0];

        // 3. We pass the *actual* data row to the mapper
        return mapObjectArrayToUserAdminDto(actualDataRow);
    }

    public UserAdminDto updateUser(Long id, UserAdminUpdateDto updateDto) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        user.setUsername(updateDto.getUsername());
        user.setPhone(updateDto.getPhone());
        user.setAddress(updateDto.getAddress());
        user.setRole(updateDto.getRole());

        Users savedUser = userRepository.save(user);

        return getUserDetail(savedUser.getId()); // Re-fetch with stats
    }

    public UserAdminDto updateUserStatus(Long id, UserStatusUpdateDto statusDto) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        switch (statusDto.getStatus()) {
            case "ACTIVE":
                user.setDeleted(false);
                user.setDeletedAt(null);
                break;
            case "INACTIVE":
                user.setDeleted(true);
                user.setDeletedAt(LocalDate.now());
                break;
            default:
                throw new IllegalArgumentException("Invalid status: " + statusDto.getStatus());
        }

        Users savedUser = userRepository.save(user);

        return getUserDetail(savedUser.getId());
    }
    private UserAdminDto mapObjectArrayToUserAdminDto(Object[] row) {
        // --- Handle Role (index 5) ---
        Role role = Role.USER; // Default
        if (row[5] != null) {
            try {
                role = Role.valueOf(row[5].toString());
            } catch (Exception e) {
                System.err.println("Could not parse Role: " + row[5]);
            }
        }

        // --- Handle createdAt (index 6) ---
        LocalDate createdAt = null; // Default
        if (row[6] != null) {
            if (row[6] instanceof LocalDate) {
                createdAt = (LocalDate) row[6];
            } else if (row[6] instanceof java.sql.Date) {
                createdAt = ((java.sql.Date) row[6]).toLocalDate();
            } else if (row[6] instanceof java.sql.Timestamp) {
                createdAt = ((java.sql.Timestamp) row[6]).toLocalDateTime().toLocalDate();
            }
        }

        // --- Handle isDeleted (index 7) ---
        boolean deleted = false; // Default
        if (row[7] != null) {
            if (row[7] instanceof Boolean) {
                deleted = (Boolean) row[7];
            } else if (row[7] instanceof Number) {
                deleted = ((Number) row[7]).intValue() == 1; // 1 means true
            }
        }

        // --- Handle totalOrders (index 8) ---
        Long totalOrders = (Long) row[8];

        // --- Handle totalExpenditure (index 9) ---
        BigDecimal expenditure = BigDecimal.ZERO; // Default
        if (row[9] != null) {
            if (row[9] instanceof BigDecimal) {
                expenditure = (BigDecimal) row[9];
            } else if (row[9] instanceof Number) {
                expenditure = BigDecimal.valueOf(((Number) row[9]).doubleValue());
            }
        }

        // --- Call the DTO constructor ---
        return new UserAdminDto(
                (Long) row[0],             // id
                (String) row[1],           // username
                (String) row[2],           // email
                (String) row[3],           // phone
                (String) row[4],           // address
                role,
                createdAt,
                deleted,
                totalOrders,
                expenditure
        );
    }

    public String getProfileImagePath(String email) {
        return null;
    }

    public Optional<Object> findById(Long userId) {
        return Optional.of(userRepository.findById(userId));
    }
    // ===== 관리자 유저관리창 끝 =====
}
