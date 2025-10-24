package com.scentelier.backend.controller;

import com.scentelier.backend.entity.Inquiry;
import com.scentelier.backend.service.InquiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
@CrossOrigin(origins = "*")
public class InquiryController {

    @Autowired
    private InquiryService inquiryService;

    @PostMapping("/save")
    public Map<String, Object> handleInquiry(@RequestBody Inquiry inquiry) {
        Map<String, Object> response = new HashMap<>();
        System.out.println(inquiry);

        try {
            Inquiry saved = inquiryService.saveInquiry(inquiry);
            response.put("success", true);
            response.put("data", saved);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }
}