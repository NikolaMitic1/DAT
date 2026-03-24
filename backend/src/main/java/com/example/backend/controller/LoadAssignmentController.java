package com.example.backend.controller;

import com.example.backend.dto.request.CreateLoadAssignmentRequest;
import com.example.backend.dto.request.UpdateAssignmentStatusRequest;
import com.example.backend.entity.CustomUserDetails;
import com.example.backend.entity.LoadAssignment;
import com.example.backend.service.LoadAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class LoadAssignmentController {

    private final LoadAssignmentService loadAssignmentService;

    @PostMapping("/create")
    public ResponseEntity<LoadAssignment> createAssignment(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody CreateLoadAssignmentRequest request) {
        LoadAssignment assignment = loadAssignmentService.createAssignment(user.getEmail(), request);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/load/{loadId}")
    public ResponseEntity<LoadAssignment> getAssignmentByLoadId(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable UUID loadId) {
        LoadAssignment assignment = loadAssignmentService.getAssignmentByLoadId(loadId);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/my")
    public ResponseEntity<List<LoadAssignment>> getMyAssignments(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<LoadAssignment> assignments = loadAssignmentService.getMyAssignments(user.getEmail());
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/for-my-loads")
    public ResponseEntity<List<LoadAssignment>> getAssignmentsForMyLoads(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<LoadAssignment> assignments = loadAssignmentService.getAssignmentsForMyLoads(user.getEmail());
        return ResponseEntity.ok(assignments);
    }

    @PutMapping("/{assignmentId}/status")
    public ResponseEntity<LoadAssignment> updateStatus(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable UUID assignmentId,
            @RequestBody UpdateAssignmentStatusRequest request) {
        LoadAssignment assignment = loadAssignmentService.updateStatus(user.getEmail(), assignmentId, request);
        return ResponseEntity.ok(assignment);
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable UUID assignmentId) {
        loadAssignmentService.deleteAssignment(user.getEmail(), assignmentId);
        return ResponseEntity.ok().build();
    }
}
