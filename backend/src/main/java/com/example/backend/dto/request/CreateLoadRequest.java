package com.example.backend.dto.request;

import com.example.backend.enums.LoadSize;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateLoadRequest {
    private String referenceNumber;
    private String description;
    private String pickupLocation;
    private LocalDateTime pickUpDateTime;
    private String deliveryLocation;
    private LocalDateTime deliveryDateTime;
    private Double weight;
    private String commodity;
    private Double price;
    private LoadSize size;
}
