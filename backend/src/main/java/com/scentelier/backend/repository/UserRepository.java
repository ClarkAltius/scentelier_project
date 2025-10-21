package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepository extends JpaRepository<Users, Long> {

    //checks for uniquenss
    Users findByEmail(String email);
}
