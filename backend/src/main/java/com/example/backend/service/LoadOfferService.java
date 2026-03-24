package com.example.backend.service;

import com.example.backend.dto.request.CreateLoadOfferRequest;
import com.example.backend.dto.request.UpdateOfferStatusRequest;
import com.example.backend.entity.Load;
import com.example.backend.entity.LoadOffer;
import com.example.backend.entity.Truck;
import com.example.backend.entity.User;
import com.example.backend.enums.LoadStatus;
import com.example.backend.enums.OfferStatus;
import com.example.backend.enums.TruckStatus;
import com.example.backend.enums.UserRole;
import com.example.backend.repository.LoadOfferRepository;
import com.example.backend.repository.LoadRepository;
import com.example.backend.repository.TruckRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoadOfferService {

    private final LoadOfferRepository loadOfferRepository;
    private final LoadRepository loadRepository;
    private final TruckRepository truckRepository;
    private final UserRepository userRepository;

    @Transactional
    public LoadOffer createOffer(String userEmail, CreateLoadOfferRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.CARRIER) {
            throw new RuntimeException("Only carriers can create offers");
        }

        Load load = loadRepository.findById(request.getLoadId())
                .orElseThrow(() -> new RuntimeException("Load not found"));

        if (load.getStatus() != LoadStatus.POSTED) {
            throw new RuntimeException("Load is not available for offers");
        }

        Truck truck = truckRepository.findById(request.getTruckId())
                .orElseThrow(() -> new RuntimeException("Truck not found"));

        if (!truck.getDriver().getId().equals(user.getId())) {
            throw new RuntimeException("Truck does not belong to this user");
        }

        if (truck.getTruckStatus() != TruckStatus.AVAILABLE) {
            throw new RuntimeException("Truck is not available");
        }

        if (loadOfferRepository.existsByLoadAndTruck(load, truck)) {
            throw new RuntimeException("Offer already exists for this load and truck");
        }

        LoadOffer offer = LoadOffer.builder()
                .load(load)
                .truck(truck)
                .offeredPrice(request.getOfferedPrice())
                .offerStatus(OfferStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return loadOfferRepository.save(offer);
    }

    public List<LoadOffer> getOffersForLoad(UUID loadId) {
        return loadOfferRepository.findByLoadId(loadId);
    }

    public List<LoadOffer> getOffersForMyTrucks(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.CARRIER) {
            throw new RuntimeException("Only carriers can view their offers");
        }

        return loadOfferRepository.findAll().stream()
                .filter(offer -> offer.getTruck().getDriver() != null
                        && offer.getTruck().getDriver().getId().equals(user.getId()))
                .toList();
    }

    public List<LoadOffer> getMyLoadOffers(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.BROKER) {
            throw new RuntimeException("Only brokers can view offers on their loads");
        }

        return loadOfferRepository.findAll().stream()
                .filter(offer -> offer.getLoad().getBroker().getId().equals(user.getId()))
                .toList();
    }

    @Transactional
    public LoadOffer updateOfferStatus(String userEmail, UUID offerId, UpdateOfferStatusRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LoadOffer offer = loadOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (!offer.getLoad().getBroker().getId().equals(user.getId())) {
            throw new RuntimeException("Offer does not belong to this broker");
        }

        if (offer.getOfferStatus() != OfferStatus.PENDING) {
            throw new RuntimeException("Offer status cannot be changed");
        }

        offer.setOfferStatus(request.getStatus());
        offer.setUpdatedAt(LocalDateTime.now());

        if (request.getStatus() == OfferStatus.ACCEPTED) {
            Load load = offer.getLoad();
            load.setStatus(LoadStatus.BOOKED);
            load.setTruck(offer.getTruck());
            loadRepository.save(load);

            Truck truck = offer.getTruck();
            truck.setTruckStatus(TruckStatus.ON_LOAD);
            truckRepository.save(truck);

            loadOfferRepository.findByLoad(load).stream()
                    .filter(o -> !o.getId().equals(offerId))
                    .forEach(o -> {
                        o.setOfferStatus(OfferStatus.REJECTED);
                        o.setUpdatedAt(LocalDateTime.now());
                        loadOfferRepository.save(o);
                    });
        }

        return loadOfferRepository.save(offer);
    }

    @Transactional
    public void cancelOffer(String userEmail, UUID offerId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LoadOffer offer = loadOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (!offer.getTruck().getDriver().getId().equals(user.getId())) {
            throw new RuntimeException("Offer does not belong to this carrier");
        }

        if (offer.getOfferStatus() != OfferStatus.PENDING) {
            throw new RuntimeException("Only pending offers can be cancelled");
        }

        offer.setOfferStatus(OfferStatus.REJECTED);
        offer.setUpdatedAt(LocalDateTime.now());
        loadOfferRepository.save(offer);
    }
}
