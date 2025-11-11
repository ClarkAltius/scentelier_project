package com.scentelier.backend.repository;

import com.scentelier.backend.entity.InquiryFollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InquiryFollowUpRepository extends JpaRepository<InquiryFollowUp, Long> {


    List<InquiryFollowUp> findAllByInquiryIdOrderByCreatedAtAsc(Long inquiryId);

}