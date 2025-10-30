package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Long> {

    Optional<Users> findByEmail(String email);
    
    // 최근 30일간 생성된 유저 수 반환
    @Query("SELECT COUNT(u) FROM Users u WHERE u.createdAt >= :date")
    int countNewUsersSince(@Param("date") java.time.LocalDate date);
}
