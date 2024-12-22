package com.iot.backend.service;

import com.iot.backend.model.Led;
import com.iot.backend.model.LedStatus;
import com.iot.backend.repository.LedRepository;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.Date;

@Service
public class LedService {

    @Autowired
    private LedRepository repository;

    public void saveOrUpdateLed(String name, String status) {
        Led led = repository.findByName(name).orElse(new Led());
        led.setName(name);
        led.setStatus(LedStatus.valueOf(status.toUpperCase()));
        led.setTimestamp(new Date().toInstant());
        repository.save(led);
        System.out.println("💡 LED data saved: " + led);
    }
}
