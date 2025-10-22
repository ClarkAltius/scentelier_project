package com.scentelier.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test/my-roles")
    public String getMyRoles(Authentication authentication) {
        if (authentication == null) {
            return "Not authenticated";
        }
        // This will return a string like "[ROLE_USER, ROLE_ADMIN]"
        return authentication.getAuthorities().toString();
    }
}