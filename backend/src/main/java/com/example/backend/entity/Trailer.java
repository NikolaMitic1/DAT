package com.example.backend.entity;

import com.example.backend.enums.Equipment;
import jakarta.persistence.*;
import lombok.*;


import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "trailers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trailer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private Equipment trailerType;

    private Double length;
    private Double width;
    private Double height;
    private Double maxWeight;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "truck_id")
    private Truck assignedTruck;
}
