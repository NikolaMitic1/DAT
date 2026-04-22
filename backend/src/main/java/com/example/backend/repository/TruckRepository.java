package com.example.backend.repository;

import com.example.backend.entity.Truck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TruckRepository extends JpaRepository<Truck, UUID> {

    Optional<Truck> findByTruckNumber(String truckNumber);

    Optional<Truck> findByLicensePlate(String licensePlate);

    List<Truck> findByCarrierEmail(String email);
}
