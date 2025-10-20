package com.scentelier.backend.repository;

import com.scentelier.backend.entity.RestockRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestockRequestItemRepository extends JpaRepository<RestockRequestItem, Long> {
}