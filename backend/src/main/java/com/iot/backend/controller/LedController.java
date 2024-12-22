package com.iot.backend.controller;

import com.iot.backend.service.MqttService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/led")
public class LedController {
    private final MqttService mqttService;

    @Autowired
    public LedController(MqttService mqttService) {
        this.mqttService = mqttService;
    }

    @PostMapping("/on")
    public String turnOnLed(@RequestParam String name) {
        mqttService.sendLedCommand(name, "ON");
        return "Đã gửi lệnh bật LED: " + name;
    }

    @PostMapping("/off")
    public String turnOffLed(@RequestParam String name) {
        mqttService.sendLedCommand(name, "OFF");
        return "Đã gửi lệnh tắt LED: " + name;
    }
}
