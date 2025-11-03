package com.scentelier.backend.repository;

import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomPerfumeRepository extends JpaRepository<CustomPerfume, Long> {



    List<CustomPerfume> findByUsers(Users user);
}
