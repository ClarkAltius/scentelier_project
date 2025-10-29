package com.scentelier.backend.repository;

import com.scentelier.backend.entity.InquiryAnswers;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InquiryAnswerRepository extends JpaRepository<InquiryAnswers, Long> {
    List<InquiryAnswers> findByInquiryId(Long inquiryId);
}
