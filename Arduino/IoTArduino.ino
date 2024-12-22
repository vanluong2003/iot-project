#include "DHT.h"

int led1Pin = 8;
int led2Pin = 9;
int buzzerPin = 10;
int lastPotValue = 0;

int DHTPIN = 2;
const int DHTTYPE = DHT11;
DHT dht(DHTPIN, DHTTYPE);
float lastTemperature = 0;
float lastHumidity = 0;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 60000;

void setup() {
  pinMode(led1Pin, OUTPUT);
  pinMode(led2Pin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  dht.begin();
}
void loop() {
  unsigned long currentTime = millis();
  int potValue = map(analogRead(A0), 0, 1023, 0, 100);
  if (potValue != lastPotValue) {
    //String sendData = "potVal:" + String(potValue);
    Serial.print("Pot: ");
    Serial.println(potValue);
    lastPotValue = potValue;
  }
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (currentTime - lastSendTime >= sendInterval) {
    Serial.print("Tem: ");
    Serial.print(t);
    lastTemperature = t;
    Serial.print(" - Hum: ");
    Serial.println(h);
    lastHumidity = h;

    lastSendTime = currentTime;
  }
  serialEvent();
  delay(150);
}
String str;
void serialEvent() {
  if (Serial.available() > 0)
  {
    str = Serial.readStringUntil('\n');
    if (str.length() > 0) {
      str =  str.substring(0, str.length() - 1);
      Serial.println(str);
      executeCommand(str);
    }
  }

}

bool led1 = false;
bool led2 = false;
bool buzzer = false;
void executeCommand(String command) {

  if (command == "led1") {
    led1 = !led1;
    digitalWrite(led1Pin, led1);
  } else if (command == "led1 ON") {
    led1 = true;
    digitalWrite(led1Pin, HIGH);
  } else if (command == "led1 OFF") {
    led1 = false;
    digitalWrite(led1Pin, LOW);
  }
  else if (command == "led2") {
    led2 = !led2;
    digitalWrite(led2Pin, led2);
  } else if (command == "led2 ON") {
    led2 = true;
    digitalWrite(led2Pin, HIGH);
  } else if (command == "led2 OFF") {
    led2 = false;
    digitalWrite(led2Pin, LOW);
  }
  else if (command == "buzzer") {
    buzzer = !buzzer;
    digitalWrite(buzzerPin, buzzer);
  } else if (command == "buzzer ON") {
    buzzer = true;
    digitalWrite(buzzerPin, HIGH);
  } else if (command == "buzzer OFF") {
    buzzer = false;
    digitalWrite(buzzerPin, LOW);
  }

}