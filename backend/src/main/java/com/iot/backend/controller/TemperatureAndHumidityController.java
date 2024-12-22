package com.iot.backend.controller;

import com.iot.backend.model.TemperatureAndHumidity;
import com.iot.backend.response.ApiResponse;
import com.iot.backend.service.TemperatureAndHumidityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/temperature-humidity")
public class TemperatureAndHumidityController {
    private final TemperatureAndHumidityService temperatureAndHumidityService;

    @Autowired
    public TemperatureAndHumidityController(TemperatureAndHumidityService temperatureAndHumidityService) {
        this.temperatureAndHumidityService = temperatureAndHumidityService;
    }

    @GetMapping("/latest-data")
    public ResponseEntity<ApiResponse> getLatestData(){
        try {
            TemperatureAndHumidity temperatureAndHumidity = temperatureAndHumidityService.getLatestTemperatureAndHumidity();
            return ResponseEntity.ok(new ApiResponse("Success", temperatureAndHumidity));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
