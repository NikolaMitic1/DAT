package com.example.backend.dto;

import com.example.backend.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class AuthResponse {
    private String token;
    private UserRole role;
}
