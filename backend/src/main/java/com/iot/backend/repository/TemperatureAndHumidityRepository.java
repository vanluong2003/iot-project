package com.iot.backend.repository;

import com.iot.backend.model.TemperatureAndHumidity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemperatureAndHumidityRepository extends JpaRepository<TemperatureAndHumidity, Long>{
    Optional<TemperatureAndHumidity> findByName(String name);

    @Query("SELECT s FROM TemperatureAndHumidity s ORDER BY s.timestamp DESC")
    List<TemperatureAndHumidity> findLatestDataList();
}
