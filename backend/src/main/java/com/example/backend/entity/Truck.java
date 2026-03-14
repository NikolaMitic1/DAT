package com.example.backend.entity;

import com.example.backend.enums.Equipment;
import com.example.backend.enums.TruckStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trucks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Truck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String truckNumber;

    @Column(unique = true, nullable = false)
    private String licensePlate;

    private String make;
    private String model;
    private int year;
    private int mileage;

    @Enumerated(EnumType.STRING)
    private Equipment equipment;

    private double maxWeight;
    private double truckLength;

    private String currentLocation;

    private LocalDateTime availableFrom;

    @Enumerated(EnumType.STRING)
    private TruckStatus truckStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private User driver;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "trailer_id")
    private Trailer trailer;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
