package com.scentelier.backend.service;

import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.repository.CustomPerfumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomPerfumeService {
    private final CustomPerfumeRepository customPerfumeRepository;


    public Optional<CustomPerfume> findCustomPerfumeById(Long customId) {
        return customPerfumeRepository.findById(customId);
    }
}
