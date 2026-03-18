package com.example.backend.controller;

import com.example.backend.dto.request.CreateLoadRequest;
import com.example.backend.entity.Load;
import com.example.backend.service.LoadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loads")
@RequiredArgsConstructor
public class LoadController {

    private final LoadService loadService;

    @PostMapping("/create")
    public ResponseEntity<Load> createLoad(@AuthenticationPrincipal String email, @RequestBody CreateLoadRequest request) {
        Load load = loadService.createLoadForBroker(email, request);
        return ResponseEntity.ok(load);
    }


    @GetMapping("/my-loads")
    public ResponseEntity<List<Load>> getMyLoads(@AuthenticationPrincipal String email) {
        List<Load> loads = loadService.getLoadsForBroker(email);
        return ResponseEntity.ok(loads);
    }

}
