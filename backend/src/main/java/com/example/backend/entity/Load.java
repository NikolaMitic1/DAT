package com.example.backend.entity;

import com.example.backend.enums.LoadSize;
import com.example.backend.enums.LoadStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "loads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Load {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String referenceNumber;

    private String description;

    private String pickupLocation;
    private LocalDateTime pickUpDateTime;

    private String deliveryLocation;
    private LocalDateTime deliveryDateTime;

    private Double weight;
    private String commodity;

    private Double price;

    @Enumerated(EnumType.STRING)
    private LoadStatus status;

    @Enumerated(EnumType.STRING)
    private LoadSize size;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "broker_id")
    private User broker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "truck_id")
    private Truck truck;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


}
