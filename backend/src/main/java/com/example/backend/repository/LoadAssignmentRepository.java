package com.example.backend.repository;

import com.example.backend.entity.Load;
import com.example.backend.entity.LoadAssignment;
import com.example.backend.entity.Truck;
import com.example.backend.entity.User;
import com.example.backend.enums.LoadAssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoadAssignmentRepository extends JpaRepository<LoadAssignment, UUID> {

    Optional<LoadAssignment> findByLoad(Load load);

    Optional<LoadAssignment> findByLoadId(UUID loadId);

    List<LoadAssignment> findByTruck(Truck truck);

    List<LoadAssignment> findByTruckId(UUID truckId);

    List<LoadAssignment> findByDriver(User driver);

    List<LoadAssignment> findByDriverId(UUID driverId);

    List<LoadAssignment> findByStatus(LoadAssignmentStatus status);

    boolean existsByLoad(Load load);

    boolean existsByLoadId(UUID loadId);
}
