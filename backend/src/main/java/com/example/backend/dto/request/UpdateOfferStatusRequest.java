package com.example.backend.dto.request;

import com.example.backend.enums.OfferStatus;
import lombok.Data;

@Data
public class UpdateOfferStatusRequest {
    private OfferStatus status;
}
