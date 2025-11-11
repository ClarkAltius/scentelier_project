package com.scentelier.backend.controller;

import com.scentelier.backend.entity.InquiryFollowUp;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.service.InquiryFollowUpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.scentelier.backend.dto.InquiryFollowUpDto;
import com.scentelier.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiry") // We'll nest this under the main /api/inquiry path
public class InquiryFollowUpController {

    @Autowired
    private InquiryFollowUpService followUpService;
    @Autowired
    private UserRepository userRepository;
    /**
     * API for the chat app to GET all messages for a specific inquiry.
     */
    @GetMapping("/{inquiryId}/followups")
    public ResponseEntity<List<InquiryFollowUpDto>> getInquiryFollowUps(@PathVariable Long inquiryId) {
        List<InquiryFollowUpDto> followUps = followUpService.getFollowUps(inquiryId);
        return ResponseEntity.ok(followUps);
    }

    /**
     * API now returns the newly created DTO
     */
    @PostMapping("/{inquiryId}/followup")
    public ResponseEntity<InquiryFollowUpDto> postFollowUp(
            @PathVariable Long inquiryId,
            @RequestBody Map<String, String> payload,
            // --- 4. CHANGE THE @AuthenticationPrincipal ---
            @AuthenticationPrincipal User principal) { // Get Spring's User object

        // --- 5. FIND THE REAL AUTHOR ENTITY ---
        if (principal == null) {
            return ResponseEntity.status(401).build(); // User not logged in
        }

        String userEmail = principal.getUsername(); // This is the user's email
        Users author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Author not found with email: " + userEmail));

        // --- From here, your original code is perfect ---
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        InquiryFollowUpDto newFollowUpDto = followUpService.postFollowUp(inquiryId, message, author);
        return ResponseEntity.ok(newFollowUpDto);
    }
}
