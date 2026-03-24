package com.example.backend.service;

import com.example.backend.dto.request.CreateLoadAssignmentRequest;
import com.example.backend.dto.request.UpdateAssignmentStatusRequest;
import com.example.backend.entity.Load;
import com.example.backend.entity.LoadAssignment;
import com.example.backend.entity.Truck;
import com.example.backend.entity.User;
import com.example.backend.enums.LoadAssignmentStatus;
import com.example.backend.enums.LoadStatus;
import com.example.backend.enums.TruckStatus;
import com.example.backend.enums.UserRole;
import com.example.backend.repository.LoadAssignmentRepository;
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
public class LoadAssignmentService {

    private final LoadAssignmentRepository loadAssignmentRepository;
    private final LoadRepository loadRepository;
    private final TruckRepository truckRepository;
    private final UserRepository userRepository;

    @Transactional
    public LoadAssignment createAssignment(String userEmail, CreateLoadAssignmentRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.BROKER) {
            throw new RuntimeException("Only brokers can create assignments");
        }

        Load load = loadRepository.findById(request.getLoadId())
                .orElseThrow(() -> new RuntimeException("Load not found"));

        if (!load.getBroker().getId().equals(user.getId())) {
            throw new RuntimeException("Load does not belong to this broker");
        }

        if (loadAssignmentRepository.existsByLoad(load)) {
            throw new RuntimeException("Assignment already exists for this load");
        }

        Truck truck = truckRepository.findById(request.getTruckId())
                .orElseThrow(() -> new RuntimeException("Truck not found"));

        User driver = userRepository.findById(request.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (driver.getRole() != UserRole.CARRIER) {
            throw new RuntimeException("Selected user is not a carrier");
        }

        LoadAssignment assignment = LoadAssignment.builder()
                .load(load)
                .truck(truck)
                .driver(driver)
                .status(LoadAssignmentStatus.ACTIVE)
                .startTime(LocalDateTime.now())
                .build();

        load.setStatus(LoadStatus.IN_TRANSPORT);
        load.setTruck(truck);
        loadRepository.save(load);

        truck.setTruckStatus(TruckStatus.ON_LOAD);
        truckRepository.save(truck);

        return loadAssignmentRepository.save(assignment);
    }

    public LoadAssignment getAssignmentByLoadId(UUID loadId) {
        return loadAssignmentRepository.findByLoadId(loadId)
                .orElseThrow(() -> new RuntimeException("Assignment not found for this load"));
    }

    public List<LoadAssignment> getMyAssignments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.CARRIER) {
            throw new RuntimeException("Only carriers can view their assignments");
        }

        return loadAssignmentRepository.findByDriverId(user.getId());
    }

    public List<LoadAssignment> getAssignmentsForMyLoads(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.BROKER) {
            throw new RuntimeException("Only brokers can view assignments for their loads");
        }

        return loadAssignmentRepository.findAll().stream()
                .filter(assignment -> assignment.getLoad().getBroker().getId().equals(user.getId()))
                .toList();
    }

    @Transactional
    public LoadAssignment updateStatus(String userEmail, UUID assignmentId, UpdateAssignmentStatusRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LoadAssignment assignment = loadAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (user.getRole() == UserRole.CARRIER) {
            if (!assignment.getDriver().getId().equals(user.getId())) {
                throw new RuntimeException("Assignment does not belong to this carrier");
            }
        } else if (user.getRole() == UserRole.BROKER) {
            if (!assignment.getLoad().getBroker().getId().equals(user.getId())) {
                throw new RuntimeException("Assignment does not belong to this broker");
            }
        } else {
            throw new RuntimeException("Only carriers or brokers can update assignment status");
        }

        LoadAssignmentStatus newStatus = request.getStatus();

        if (newStatus == LoadAssignmentStatus.COMPLETED) {
            assignment.setEndTime(LocalDateTime.now());

            Load load = assignment.getLoad();
            load.setStatus(LoadStatus.DELIVERED);
            loadRepository.save(load);

            Truck truck = assignment.getTruck();
            truck.setTruckStatus(TruckStatus.AVAILABLE);
            truckRepository.save(truck);
        } else if (newStatus == LoadAssignmentStatus.CANCELLED) {
            assignment.setEndTime(LocalDateTime.now());

            Load load = assignment.getLoad();
            load.setStatus(LoadStatus.POSTED);
            load.setTruck(null);
            loadRepository.save(load);

            Truck truck = assignment.getTruck();
            truck.setTruckStatus(TruckStatus.AVAILABLE);
            truckRepository.save(truck);
        }

        assignment.setStatus(newStatus);
        return loadAssignmentRepository.save(assignment);
    }

    @Transactional
    public void deleteAssignment(String userEmail, UUID assignmentId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LoadAssignment assignment = loadAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (user.getRole() != UserRole.BROKER) {
            throw new RuntimeException("Only brokers can delete assignments");
        }

        if (!assignment.getLoad().getBroker().getId().equals(user.getId())) {
            throw new RuntimeException("Assignment does not belong to this broker");
        }

        Load load = assignment.getLoad();
        load.setStatus(LoadStatus.POSTED);
        load.setTruck(null);
        loadRepository.save(load);

        Truck truck = assignment.getTruck();
        truck.setTruckStatus(TruckStatus.AVAILABLE);
        truckRepository.save(truck);

        loadAssignmentRepository.delete(assignment);
    }
}
