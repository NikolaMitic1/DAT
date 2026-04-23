package com.example.backend.service;

import com.example.backend.dto.request.LoadRequest;
import com.example.backend.dto.request.CreateLoadRequest;
import com.example.backend.dto.request.UpdateLoadRequest;
import com.example.backend.entity.Load;
import com.example.backend.entity.User;
import com.example.backend.enums.UserRole;
import com.example.backend.enums.LoadStatus;
import com.example.backend.repository.LoadRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LoadService {

    private final LoadRepository  loadRepository;
    private final UserRepository userRepository;

    public List<Load> getLoadsForBroker(String email) {
        User broker = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Broker not found"));

        if (broker.getRole() != UserRole.BROKER) {
            throw new RuntimeException("User is not a broker");
        }

        return loadRepository.findByBroker(broker);
    }
//-------------------------------------------------------------------------------------------------------------------------
    public Load createLoadForBroker(String email, CreateLoadRequest request) {
        User broker = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Broker not found"));

        if (broker.getRole() != UserRole.BROKER) {
            throw new RuntimeException("User is not a broker");
        }

        Load load = new Load();
        load.setBroker(broker); // postavljanje ko je broker
        String ref = (request.getReferenceNumber() != null && !request.getReferenceNumber().isBlank())
                ? request.getReferenceNumber()
                : "LD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        load.setReferenceNumber(ref);
        load.setDescription(request.getDescription());
        load.setPickupLocation(request.getPickupLocation());
        load.setPickUpDateTime(request.getPickUpDateTime());
        load.setDeliveryLocation(request.getDeliveryLocation());
        load.setDeliveryDateTime(request.getDeliveryDateTime());
        load.setWeight(request.getWeight());
        load.setCommodity(request.getCommodity());
        load.setPrice(request.getPrice());
        load.setSize(request.getSize());
        load.setTruck(null);
        load.setStatus(LoadStatus.POSTED); // status je POSTED po defaultu

        return loadRepository.save(load);
    }

    public Load createLoad(Load load) {
        return loadRepository.save(load);
    }

    public List<Load> getLoadsByBroker(User broker) {
        return loadRepository.findByBroker(broker);
    }

    public List<Load> getAllLoads() {
        return loadRepository.findAll();
    }

    public Load getLoadByReferenceNumber(String number) {
        return loadRepository.findByReferenceNumber(number).orElseThrow(() -> new RuntimeException("Load not found"));
    }

    public Load updateLoadForBroker(String email, UUID loadId, UpdateLoadRequest request) {
        User broker = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Broker not found"));

        if (broker.getRole() != UserRole.BROKER) {
            throw new RuntimeException("User is not a broker");
        }

        Load load = loadRepository.findById(loadId)
                .orElseThrow(() -> new RuntimeException("Load not found"));

        if (!load.getBroker().getId().equals(broker.getId())) {
            throw new RuntimeException("Load does not belong to this broker");
        }

        load.setReferenceNumber(request.getReferenceNumber());
        load.setDescription(request.getDescription());
        load.setPickupLocation(request.getPickupLocation());
        load.setPickUpDateTime(request.getPickUpDateTime());
        load.setDeliveryLocation(request.getDeliveryLocation());
        load.setDeliveryDateTime(request.getDeliveryDateTime());
        load.setWeight(request.getWeight());
        load.setCommodity(request.getCommodity());
        load.setPrice(request.getPrice());
        load.setSize(request.getSize());
        load.setStatus(request.getStatus());

        return loadRepository.save(load);
    }
}
