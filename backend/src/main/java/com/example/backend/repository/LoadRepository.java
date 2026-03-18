package com.example.backend.repository;

import com.example.backend.entity.Load;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface LoadRepository extends JpaRepository<Load, UUID> {

    Optional<Load> findByReferenceNumber(String number);


    List<Load> findByBroker(User broker);
    List<Load> findByStatus(String status);
}
