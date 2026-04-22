package com.example.backend.controller;

import com.example.backend.dto.request.CreateLoadRequest;
import com.example.backend.dto.request.UpdateLoadRequest;
import com.example.backend.entity.CustomUserDetails;
import com.example.backend.entity.Load;
import com.example.backend.service.LoadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/loads")
@RequiredArgsConstructor
public class LoadController {

    private final LoadService loadService;

    @PostMapping("/create")
    public ResponseEntity<Load> createLoad(@AuthenticationPrincipal CustomUserDetails user,
            @RequestBody CreateLoadRequest request) {
        Load load = loadService.createLoadForBroker(user.getEmail(), request);
        return ResponseEntity.ok(load);
    }

    @GetMapping("/")
    public ResponseEntity<List<Load>> getAllLoads() {
        List<Load> loads = loadService.getAllLoads();
        return ResponseEntity.ok(loads);
    }

    @GetMapping("/my-loads")
    public ResponseEntity<List<Load>> getMyLoads(@AuthenticationPrincipal CustomUserDetails user) {
        List<Load> loads = loadService.getLoadsForBroker(user.getEmail());
        return ResponseEntity.ok(loads);
    }

    @PostMapping("/edit/{id}")
    public ResponseEntity<Load> editLoad(@AuthenticationPrincipal CustomUserDetails user,
            @PathVariable UUID id,
            @RequestBody UpdateLoadRequest request) {
        Load load = loadService.updateLoadForBroker(user.getEmail(), id, request);
        return ResponseEntity.ok(load);
    }

}
