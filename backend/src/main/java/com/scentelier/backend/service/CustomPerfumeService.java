package com.scentelier.backend.service;

import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.CustomPerfumeRepository;
import com.scentelier.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomPerfumeService {
    private final CustomPerfumeRepository customPerfumeRepository;
    private final UserRepository userRepository;


    public Optional<CustomPerfume> findCustomPerfumeById(Long customId) {
        return customPerfumeRepository.findById(customId);
    }

    public List<CustomPerfume> findByUsers(Users users) {
        return customPerfumeRepository.findByUsers(users);
    }
}
