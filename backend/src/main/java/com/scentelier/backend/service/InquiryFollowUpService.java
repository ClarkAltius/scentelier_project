package com.scentelier.backend.service;
import com.scentelier.backend.dto.InquiryFollowUpDto;
import com.scentelier.backend.entity.Inquiry;
import com.scentelier.backend.entity.InquiryFollowUp;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.InquiryFollowUpRepository;
import com.scentelier.backend.repository.InquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InquiryFollowUpService {

    @Autowired
    private InquiryFollowUpRepository followUpRepository;

    @Autowired
    private InquiryRepository inquiryRepository;


    public List<InquiryFollowUpDto> getFollowUps(Long inquiryId) {
        List<InquiryFollowUp> followUps = followUpRepository.findAllByInquiryIdOrderByCreatedAtAsc(inquiryId);

        // Convert the list of Entities into a list of DTOs
        return followUps.stream()
                .map(this::toDto) // Use our new private mapper method
                .collect(Collectors.toList());
    }

    /**
     * Creates a new message, NOW returning a single DTO.
     */
    public InquiryFollowUpDto postFollowUp(Long inquiryId, String message, Users author) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found with id: " + inquiryId));

        InquiryFollowUp followUp = new InquiryFollowUp();
        followUp.setInquiry(inquiry);
        followUp.setAuthor(author);
        followUp.setMessage(message);

        InquiryFollowUp savedFollowUp = followUpRepository.save(followUp);

        // Convert and return the DTO, not the entity
        return toDto(savedFollowUp);
    }

    /**
     * Private "Mapper"
     * This is the most important part. It safely converts
     * an Entity into a DTO.
     */
    private InquiryFollowUpDto toDto(InquiryFollowUp entity) {
        InquiryFollowUpDto dto = new InquiryFollowUpDto();
        dto.setId(entity.getId());
        dto.setMessage(entity.getMessage());
        dto.setCreatedAt(entity.getCreatedAt());

        // --- The secure and efficient part ---
        // We safely get *only* the name and role from the Users object
        dto.setAuthorName(entity.getAuthor().getUsername());
        dto.setAuthorRole(entity.getAuthor().getRole());

        return dto;
    }
}