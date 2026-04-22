package com.example.backend.controller;

import com.example.backend.entity.CustomUserDetails;
import com.example.backend.entity.Truck;
import com.example.backend.service.TruckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trucks")
@RequiredArgsConstructor
public class TruckController {

    private final TruckService truckService;

    @GetMapping
    public ResponseEntity<List<Truck>> getAllTrucks() {
        return ResponseEntity.ok(truckService.getAllTrucks());
    }

    @GetMapping("/my-trucks")
    public ResponseEntity<List<Truck>> getMyTrucks(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(truckService.getTrucksForCarrier(user.getEmail()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Truck> getTruckById(@PathVariable UUID id) {
        return ResponseEntity.ok(truckService.getTruckById(id));
    }

    @PostMapping
    public ResponseEntity<Truck> createTruck(@AuthenticationPrincipal CustomUserDetails user,
                                             @RequestBody Truck truck) {
        return ResponseEntity.ok(truckService.createTruckForCarrier(user.getEmail(), truck));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Truck> updateTruck(@PathVariable UUID id, @RequestBody Truck truck) {
        return ResponseEntity.ok(truckService.updateTruck(id, truck));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTruck(@PathVariable UUID id) {
        truckService.deleteTruck(id);
        return ResponseEntity.ok().build();
    }
}
