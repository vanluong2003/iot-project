#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <SoftwareSerial.h>
#include <PubSubClient.h>

const char* ssid = "TP-Link_4F4D";
const char* password = "44875824";

const char* mqtt_server = "192.168.0.109";

SoftwareSerial s1(12, 13); // Rx, Tx

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

// LED Pin
// const int ledPin = 2;

void setup() {
  Serial.begin(115200);
  s1.begin(9600);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  // pinMode(ledPin, OUTPUT);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println();

  if (String(topic) == "sensor/data") {
    Serial.print("Changing output to ");
    StaticJsonDocument<256> doc;
    deserializeJson(doc, messageTemp);
    const char* name = doc["name"];
    const char* status = doc["status"];
    String extractedMessage = String(name) + " " + String(status);
    Serial.println(extractedMessage);
    s1.println(extractedMessage);

  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("spring-boot-client")) {
      Serial.println("connected");
      // Subscribe
      client.subscribe("sensor/data");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

String str;
void serialGetData() {
  if (s1.available() > 0) {
    String input = s1.readStringUntil('\n');
    input.trim();
    //Serial.println(input);
    if (input.length() > 0) {
      StaticJsonDocument<256> doc;
      if (input.startsWith("Tem:") && input.indexOf("Hum:") != -1) {
        // Dữ liệu dạng "Tem: 30.0 - Hum: 80.0"
        float temperature = input.substring(input.indexOf("Tem:") + 5, input.indexOf(" - Hum:")).toFloat();
        float humidity = input.substring(input.indexOf("Hum:") + 5).toFloat();

        doc["name"] = "dht11";
        doc["temperature"] = String(temperature, 1); // Chuyển thành chuỗi định dạng 1 chữ số thập phân
        doc["humidity"] = String(humidity, 1);
      } else if (input.startsWith("Pot:")) {
        // Dữ liệu dạng "Pot: 50"
        int potValue = input.substring(input.indexOf("Pot:") + 5).toInt();
        doc["name"] = "potentiometer";
        doc["value"] = String(potValue);
      } else {
        Serial.println("Dữ liệu không hợp lệ.");
      }
      String currentTime = "2024-12-18T01:18:05.587797Z"; // Bạn có thể thay thế bằng thời gian thực nếu có module RTC
      doc["time"] = currentTime;
      String jsonString;
      serializeJson(doc, jsonString); // Chuyển JSON thành chuỗi

      // Gửi dữ liệu JSON qua MQTT
      client.publish("publish", jsonString.c_str());
    }
  }
  delay(50);
}


void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  serialGetData();
}