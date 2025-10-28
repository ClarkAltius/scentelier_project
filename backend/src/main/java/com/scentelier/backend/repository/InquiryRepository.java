package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;


import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByUserId(Long userId); // userId로 조회
    @Query("SELECT i FROM Inquiry i LEFT JOIN FETCH i.user")
    List<Inquiry> findAllWithUser();
}
