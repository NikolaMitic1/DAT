package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "load_tracking")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoadTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "load_id")
    private Load load;

    private Double latitude;
    private Double longitude;

    private String statusUpdate;

    private LocalDateTime timestamp;
}
