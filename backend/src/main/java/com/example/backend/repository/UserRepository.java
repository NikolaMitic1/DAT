package com.example.backend.repository;

import com.example.backend.entity.User;
import com.example.backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByEmail(String email);
    Optional<User> findById(UUID id);
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
}
