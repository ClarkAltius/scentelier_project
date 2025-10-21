package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Long> {

    //checks for uniquenss
    Optional<Users> findByEmail(String email);
}
