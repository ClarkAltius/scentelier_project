package com.scentelier.backend.service;

import com.scentelier.backend.dto.InquiryAnswerRequestDto;
import com.scentelier.backend.dto.InquiryAnswerResponseDto;
import com.scentelier.backend.dto.InquiryDto;
import com.scentelier.backend.entity.Inquiry;
import com.scentelier.backend.entity.InquiryAnswers;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.InquiryAnswerRepository;
import com.scentelier.backend.repository.InquiryRepository;
import com.scentelier.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.persistence.EntityNotFoundException;
import com.scentelier.backend.constant.InquiryStatus;
import java.time.LocalDateTime;
import java.util.stream.Collectors;


@Service
public class InquiryService {

    @Autowired
    private InquiryRepository inquiryRepository;
    private final InquiryAnswerRepository inquiryAnswerRepository;
    private final UserRepository userRepository;

    @Autowired
    public InquiryService(InquiryRepository inquiryRepository, InquiryAnswerRepository inquiryAnswerRepository, UserRepository userRepository) {
        this.inquiryRepository = inquiryRepository;
        this.inquiryAnswerRepository = inquiryAnswerRepository;
        this.userRepository = userRepository;
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

    // 문의 아이디 검색 요청
    @Transactional(readOnly = true)
    public InquiryDto getInquiryDetail(Long inquiryId) {
        // 1. 우선 문의사항을 레포지토리 통해서 검색
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                //2. 아이디 검색이 안되면 엔티티 없음 에러!
                .orElseThrow(()->new EntityNotFoundException(inquiryId + " 아이디의 문의사항이 존재하지 않습니다"));
        //3. Dto에 답변 받은 inquiry 를 매핑. 생각보다 복잡하네...

        InquiryDto inquiryDto = new InquiryDto(inquiry);
        List<InquiryAnswers> answers = inquiryAnswerRepository.findByInquiryId(inquiryId);

        List<InquiryAnswerResponseDto> answerDtos = answers.stream()
                .map(InquiryAnswerResponseDto::new)
                .collect(Collectors.toList());

        inquiryDto.setAnswers(answerDtos);

        return inquiryDto;
    }

    // 관리자 답변 저장 요청
    @Transactional
    public InquiryAnswerResponseDto submitAnswer(
            Long inquiryId,
            InquiryAnswerRequestDto answerDto,
            String adminEmail){

        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new EntityNotFoundException("Inquiry not found with id: " + inquiryId));


        Users adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new EntityNotFoundException("Admin user not found: " + adminEmail));

        InquiryAnswers newAnswer = new InquiryAnswers();
        newAnswer.setInquiry(inquiry);
        newAnswer.setUser(adminUser); // The admin user
        newAnswer.setContent(answerDto.getContent());
        newAnswer.setCreatedAt(LocalDateTime.now());

        // 상태 변경
        inquiry.setStatus(InquiryStatus.ANSWERED);

        InquiryAnswers savedAnswer = inquiryAnswerRepository.save(newAnswer);

        return new InquiryAnswerResponseDto(savedAnswer);
    }
}