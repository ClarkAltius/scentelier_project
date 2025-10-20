package com.scentelier.backend.repository;

import com.scentelier.backend.entity.RestockRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestockRequestRepository extends JpaRepository<RestockRequest, Long> {
}