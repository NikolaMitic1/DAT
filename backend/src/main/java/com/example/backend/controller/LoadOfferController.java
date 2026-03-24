package com.example.backend.controller;

import com.example.backend.dto.request.CreateLoadOfferRequest;
import com.example.backend.dto.request.UpdateOfferStatusRequest;
import com.example.backend.entity.CustomUserDetails;
import com.example.backend.entity.LoadOffer;
import com.example.backend.service.LoadOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class LoadOfferController {

    private final LoadOfferService loadOfferService;

    @PostMapping("/create")
    public ResponseEntity<LoadOffer> createOffer(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody CreateLoadOfferRequest request) {
        LoadOffer offer = loadOfferService.createOffer(user.getEmail(), request);
        return ResponseEntity.ok(offer);
    }

    @GetMapping("/load/{loadId}")
    public ResponseEntity<List<LoadOffer>> getOffersForLoad(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable UUID loadId) {
        List<LoadOffer> offers = loadOfferService.getOffersForLoad(user.getEmail(), loadId);
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/my-offers")
    public ResponseEntity<List<LoadOffer>> getMyOffers(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<LoadOffer> offers = loadOfferService.getOffersForMyTrucks(user.getEmail());
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/for-my-loads")
    public ResponseEntity<List<LoadOffer>> getOffersForMyLoads(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<LoadOffer> offers = loadOfferService.getMyLoadOffers(user.getEmail());
        return ResponseEntity.ok(offers);
    }

    @PostMapping("/{offerId}/status")
    public ResponseEntity<LoadOffer> updateOfferStatus(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable UUID offerId,
            @RequestBody UpdateOfferStatusRequest request) {
        LoadOffer offer = loadOfferService.updateOfferStatus(user.getEmail(), offerId, request);
        return ResponseEntity.ok(offer);
    }

    @PostMapping("/{offerId}/cancel")
    public ResponseEntity<Void> cancelOffer(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable UUID offerId) {
        loadOfferService.cancelOffer(user.getEmail(), offerId);
        return ResponseEntity.ok().build();
    }
}
