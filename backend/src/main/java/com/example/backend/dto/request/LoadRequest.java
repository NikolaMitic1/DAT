package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoadRequest {
    private String referenceNumber;
    private String description;
    private String pickupLocation;
    private String pickUpDateTime;   // ISO string
    private String deliveryLocation;
    private String deliveryDateTime; // ISO string
    private Double weight;
    private String commodity;
    private Double price;
    private String size;
}
