package com.example.backend.dto;


import com.example.backend.enums.UserRole;
import lombok.Data;

@Data
public class UserDTO {
    private String name;
    private String lastname;
    private String email;
    private String password;
    private UserRole role;

}
