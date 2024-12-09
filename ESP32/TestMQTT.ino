#include <Arduino.h>
#include <WiFi.h>
#include <SoftwareSerial.h>
#include <PubSubClient.h>

const char* ssid = "Hust_TC";
const char* password = "";

const char* mqtt_server = "test.mosquitto.org";

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
.  Serial.println();
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

  // Feel free to add more if statements to control more GPIOs with MQTT

  // If a message is received on the topic esp32/output, you check if the message is either "on" or "off". 
  // Changes the output state according to the message
  if (String(topic) == "sensor/data") {
    Serial.print("Changing output to ");
    s1.println(messageTemp); // gửi data sang arduino
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
    str = s1.readStringUntil('\n');
    if(str.length()>0){
      str = str.substring(0, str.length() - 1);
      str.replace("\\", "");
      Serial.println(str);
      client.publish("sensor/data", str.c_str());
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