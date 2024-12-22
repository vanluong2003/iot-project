package com.iot.backend.service;

import com.iot.backend.model.TemperatureAndHumidity;
import com.iot.backend.repository.TemperatureAndHumidityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class TemperatureAndHumidityService {

    @Autowired
    private final TemperatureAndHumidityRepository repository;

    public TemperatureAndHumidityService(TemperatureAndHumidityRepository repository) {
        this.repository = repository;
    }

    public void saveOrUpdateTemperatureAndHumidity(String name, double temperature, double humidity) {
        TemperatureAndHumidity entity = new TemperatureAndHumidity();
        entity.setName(name);
        entity.setTemperature(temperature);
        entity.setHumidity(humidity);
        entity.setTimestamp(new Date().toInstant());
        repository.save(entity);
        System.out.println("Temperature and Humidity data saved: " + entity);
    }

    public TemperatureAndHumidity getLatestTemperatureAndHumidity() {
        List<TemperatureAndHumidity> results = repository.findLatestDataList();
        if (!results.isEmpty()) {
            return results.get(0); // Lấy bản ghi đầu tiên
        }
        return null; // Hoặc throw exception nếu không có dữ liệu
    }
}
