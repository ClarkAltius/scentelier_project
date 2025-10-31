package com.scentelier.backend.controller;

import com.scentelier.backend.dto.InquiryDto;
import com.scentelier.backend.entity.Inquiry;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.InquiryRepository;
import com.scentelier.backend.repository.UserRepository;
import com.scentelier.backend.service.InquiryService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class InquiryController {

    private final InquiryService inquiryService;
    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    public InquiryController(InquiryService inquiryService,
                             InquiryRepository inquiryRepository,
                             UserRepository userRepository) {
        this.inquiryService = inquiryService;
        this.inquiryRepository = inquiryRepository;
        this.userRepository = userRepository;
    }

    /** 문의 등록 */
    @PostMapping("/save")
    public Map<String, Object> handleInquiry(@RequestBody Inquiry inquiry) {
        Map<String, Object> response = new HashMap<>();
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            Users loggedInUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            inquiry.setUser(loggedInUser);
            Inquiry saved = inquiryService.saveInquiry(inquiry);

            response.put("success", true);
            response.put("data", saved);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    /** 내 문의 목록 조회 */
    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyInquiries() {
        Map<String, Object> response = new HashMap<>();
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null) {
                response.put("success", false);
                response.put("error", "로그인이 필요합니다");
                return ResponseEntity.status(401).body(response);
            }

            Users loggedInUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Inquiry> inquiries = inquiryService.getMyInquiries(loggedInUser.getId());
            response.put("success", true);
            response.put("data", inquiries);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /** 문의 상세 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getInquiryDetail(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            InquiryDto inquiryDto = inquiryService.getInquiryDetail(id);
            response.put("success", true);
            response.put("data", inquiryDto);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteInquiry(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            Users loggedInUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            inquiryService.softDeleteInquiry(id, loggedInUser.getId());

            response.put("success", true);
            response.put("message", "문의가 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}