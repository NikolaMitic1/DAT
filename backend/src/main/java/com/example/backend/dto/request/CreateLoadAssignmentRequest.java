package com.example.backend.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateLoadAssignmentRequest {
    private UUID loadId;
    private UUID truckId;
    private UUID driverId;
}
