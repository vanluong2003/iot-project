package com.iot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iot.backend.model.Led;
import com.iot.backend.model.LedStatus;
import com.iot.backend.repository.LedRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class MqttService implements MqttCallback {

    private final LedService ledService;
    private MqttClient client;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final TemperatureAndHumidityService temperatureAndHumidityService;

    public MqttService(LedService ledService, TemperatureAndHumidityService temperatureAndHumidityService) {
        this.ledService = ledService;
        this.temperatureAndHumidityService = temperatureAndHumidityService;
    }

    @PostConstruct
    public void connect() {
        try {
            client = new MqttClient("tcp://192.168.0.109:1883", "java-mqtt-client");
            client.setCallback(this);
            client.connect();
            client.subscribe("publish");
            client.subscribe("sensor/data");
            System.out.println("Connected to MQTT broker and subscribed to topic 'your/topic/#'");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void connectionLost(Throwable throwable) {
        System.out.println("Connection lost! Retrying...");
        connect();
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        System.out.println("Message received on topic: " + topic);
        String payload = new String(message.getPayload());
        System.out.println("Message payload: " + payload);

        try {
            // 1. Parse JSON thành đối tượng
            JsonNode jsonNode = objectMapper.readTree(payload);
            String name = jsonNode.get("name").asText();
            if(topic.equals("sensor/data")){
                String statusStr = jsonNode.get("status").asText();
                ledService.saveOrUpdateLed(name, statusStr);
                System.out.println("LED saved: ");
            }
            else if(topic.equals("publish")){
                double temperature = jsonNode.get("temperature").asDouble();
                double humidity = jsonNode.get("humidity").asDouble();
                temperatureAndHumidityService.saveOrUpdateTemperatureAndHumidity(name, temperature, humidity);
            }
        } catch (Exception e) {
            System.err.println("Error processing MQTT message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
    }

    public void sendLedCommand(String name, String status) {
        try {
            // Lấy thời gian hiện tại
            String currentTime = Instant.now().toString();

            // Tạo thông điệp JSON
            String payload = String.format(
                    "{\"name\": \"%s\", \"status\": \"%s\", \"time\": \"%s\"}",
                    name, status, currentTime
            );

            // Tạo MQTT message
            MqttMessage message = new MqttMessage(payload.getBytes());
            message.setQos(1); // QoS đảm bảo nhận ít nhất 1 lần

            // Gửi message tới topic
            String topic = "sensor/data";
            client.publish(topic, message);

            System.out.println("Đã gửi lệnh: " + payload);
        } catch (MqttException e) {
            System.err.println("Lỗi khi gửi lệnh MQTT: " + e.getMessage());
        }
    }
}
