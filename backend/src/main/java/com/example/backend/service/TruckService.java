package com.example.backend.service;

import com.example.backend.entity.Truck;
import com.example.backend.entity.User;
import com.example.backend.repository.TruckRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TruckService {

    private final TruckRepository truckRepository;
    private final UserRepository userRepository;

    public List<Truck> getAllTrucks() {
        return truckRepository.findAll();
    }

    public List<Truck> getTrucksForCarrier(String email) {
        return truckRepository.findByCarrierEmail(email);
    }

    public Truck getTruckById(UUID id) {
        return truckRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Truck not found"));
    }

    public Truck createTruck(Truck truck) {
        return truckRepository.save(truck);
    }

    public Truck createTruckForCarrier(String carrierEmail, Truck truck) {
        User carrier = userRepository.findByEmail(carrierEmail)
                .orElseThrow(() -> new RuntimeException("Carrier not found"));
        truck.setCarrier(carrier);
        return truckRepository.save(truck);
    }

    public Truck updateTruck(UUID id, Truck truckDetails) {
        Truck truck = getTruckById(id);

        truck.setTruckNumber(truckDetails.getTruckNumber());
        truck.setLicensePlate(truckDetails.getLicensePlate());
        truck.setMake(truckDetails.getMake());
        truck.setModel(truckDetails.getModel());
        truck.setYear(truckDetails.getYear());
        truck.setMileage(truckDetails.getMileage());
        truck.setEquipment(truckDetails.getEquipment());
        truck.setMaxWeight(truckDetails.getMaxWeight());
        truck.setTruckLength(truckDetails.getTruckLength());
        truck.setCurrentLocation(truckDetails.getCurrentLocation());
        truck.setAvailableFrom(truckDetails.getAvailableFrom());
        truck.setTruckStatus(truckDetails.getTruckStatus());
        truck.setDriver(truckDetails.getDriver());
        truck.setTrailer(truckDetails.getTrailer());

        return truckRepository.save(truck);
    }

    public void deleteTruck(UUID id) {
        Truck truck = getTruckById(id);
        truckRepository.delete(truck);
    }
}
