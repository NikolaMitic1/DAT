package com.example.backend.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateLoadOfferRequest {
    private UUID loadId;
    private UUID truckId;
    private Double offeredPrice;
}
