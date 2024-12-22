package com.iot.backend.repository;

import com.iot.backend.model.Led;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LedRepository extends JpaRepository<Led, Long> {
    Optional<Led> findByName(String name);
}
