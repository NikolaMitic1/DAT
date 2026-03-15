package com.example.backend.repository;

import com.example.backend.entity.User;
import com.example.backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Pronalazi korisnika po njegovom jedinstvenom ID-u.
     *
     * @param id UUID korisnika
     * @return Optional<User> koji sadrži korisnika ako postoji, ili prazan Optional ako ne postoji
     */
    Optional<User> findById(UUID id);

    /**
     * Proverava da li korisnik sa datim email-om već postoji u bazi.
     *
     * @param email Email adresa korisnika
     * @return true ako korisnik sa ovim email-om postoji, false ako ne postoji
     */
    boolean existsByEmail(String email);

    /**
     * Pronalazi korisnika po njegovoj email adresi.
     *
     * @param email Email adresa korisnika
     * @return Optional<User> koji sadrži korisnika ako postoji, ili prazan Optional ako ne postoji
     */
    Optional<User> findByEmail(String email);

    /**
     * Dobavlja sve korisnike određene firme sa datom ulogom.
     * Na primer, može se koristiti za dobijanje svih vozača (role = TRUCKER) jedne firme.
     *
     * @param companyId UUID firme kojoj korisnici pripadaju
     * @param role Uloga korisnika (TRUCKER, BROKER itd.)
     * @return Lista korisnika koji pripadaju datoj firmi i imaju zadatu ulogu
     */
    List<User> findByCompanyIdAndRole(UUID companyId, UserRole role);




}
