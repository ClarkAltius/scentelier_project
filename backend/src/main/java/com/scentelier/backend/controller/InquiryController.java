    package com.scentelier.backend.controller;

    import com.scentelier.backend.entity.Inquiry;
    import com.scentelier.backend.entity.Users;
    import com.scentelier.backend.repository.InquiryRepository;
    import com.scentelier.backend.service.InquiryService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.core.Authentication;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.web.bind.annotation.*;
    import com.scentelier.backend.repository.UserRepository;

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

                List<Inquiry> inquiries = inquiryRepository.findByUserId(loggedInUser.getId());
                response.put("success", true);
                response.put("data", inquiries);
                return ResponseEntity.ok(response);

            } catch (Exception e) {
                response.put("success", false);
                response.put("error", e.getMessage());
                return ResponseEntity.status(500).body(response);
            }
        }
    }
