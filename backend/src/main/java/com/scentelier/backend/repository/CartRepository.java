package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Carts;
import com.scentelier.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Carts, Long> {
    Optional<Carts> findByUser(Users users);
}
