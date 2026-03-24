package com.example.backend.repository;

import com.example.backend.entity.LoadOffer;
import com.example.backend.entity.Load;
import com.example.backend.entity.Truck;
import com.example.backend.enums.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoadOfferRepository extends JpaRepository<LoadOffer, UUID> {

    List<LoadOffer> findByLoad(Load load);

    List<LoadOffer> findByLoadId(UUID loadId);

    List<LoadOffer> findByTruck(Truck truck);

    List<LoadOffer> findByTruckId(UUID truckId);

    List<LoadOffer> findByOfferStatus(OfferStatus status);

    boolean existsByLoadAndTruck(Load load, Truck truck);
}
