package com.scentelier.backend.service;

import com.scentelier.backend.dto.InquiryDto;
import com.scentelier.backend.entity.Inquiry;
import com.scentelier.backend.repository.InquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InquiryService {

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    public InquiryService(InquiryRepository inquiryRepository) {
        this.inquiryRepository = inquiryRepository;
    }

    public Inquiry saveInquiry(Inquiry inquiry) {
        return inquiryRepository.save(inquiry);
    }

    public List<Inquiry> getAllInquiries() {
        return inquiryRepository.findAll();
    }

    public List<InquiryDto> findAllWithUser() {
        List<Inquiry> inquiries = inquiryRepository.findAllWithUser();

        return inquiries.stream()
                .map(InquiryDto::new)
                .collect(Collectors.toList());
    }
}