import React, { useEffect, useState } from "react";
import mqtt from "mqtt";

import {
  Button,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Switch,
} from "@chakra-ui/react";

import { AiFillAlert } from "react-icons/ai";
import { MdLightbulb } from "react-icons/md";
import { GiElectric } from "react-icons/gi";
import { BsFillChatDotsFill } from "react-icons/bs";

import "./HomePage.css";

const HomePage = () => {
  const username = "admin";
  const [data, setData] = useState();
  const [mqttClient, setMqttClient] = useState(null);
  const [potValue, setPotValue] = useState(0);
  const [leds, setLeds] = useState({ led1: false, led2: false });

  const onBuzzerClick = () => {
    sendMessage("buzzer on", "USER");
    setTimeout(() => {
      sendMessage("buzzer off", "USER");
    }, 500);
  };

  useEffect(() => {
    const client = mqtt.connect("ws://test.mosquitto.org:8080");
    setMqttClient(client);
  }, []);

  useEffect(() => {
    if (mqttClient !== null) {
      mqttClient.on("connect", () => {
        console.log("Connected to MQTT broker");
        mqttClient.subscribe("publish", (err) => {
          if (err) {
            console.log("Subscription error:", err);
          }
        });
      });

      mqttClient.on("message", (topic, message) => {
        const payload = JSON.parse(message.toString());
        if (payload?.messageType === "INPUT") {
          setPotValue(payload?.message);
        } else {
          setData(payload);
        }
      });

      mqttClient.on("error", (error) => {
        console.log("MQTT connection error:", error);
      });
    }

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [mqttClient]);

  const sendMessage = async (msg, type) => {
    if (msg !== "") {
      const data = {
        message: msg,
        username: username,
        messageType: type && type ? type : "USER",
        created: new Date(),
      };
      if (mqttClient) {
        console.log("Message sending...");
        mqttClient.publish("sensor/data", JSON.stringify(data));
      }
    }
  };

  const handleLedChange = (ledName) => {
    setLeds((prevState) => {
      const newState = { ...prevState, [ledName]: !prevState[ledName] };
      const message = newState[ledName] ? `${ledName} on` : `${ledName} off`;
      sendMessage(message, "USER");
      return newState;
    });
  };

  return (
    <div className="home-page-row" style={{ margin: 250 }}>
      <div>
        {data?.username === "admin" ? (
          ""
        ) : (
          <div>
            <div className="home-page-row">
              <BsFillChatDotsFill size={20} />
              <h1 className="home-page-message">{data?.message}</h1>
            </div>
            <Divider />
          </div>
        )}
        <div className="home-page-row">
          <GiElectric size={25} />
          <h1 className="home-page-label" htmlFor="isChecked">
            Relay
          </h1>
          <Switch
            id="isChecked"
            isChecked={leds.led1}
            onChange={() => handleLedChange("led1")}
            size="lg"
          />
        </div>
        <div className="home-page-row">
          <MdLightbulb size={25} />
          <h1 className="home-page-label" htmlFor="isChecked2">
            Led
          </h1>
          <Switch
            isChecked={leds.led2}
            onChange={() => handleLedChange("led2")}
            id="isChecked2"
            size="lg"
          />
        </div>
        <div className="home-page-row">
          <Button
            onClick={onBuzzerClick}
            leftIcon={<AiFillAlert />}
            size="lg"
            colorScheme="blue"
          >
            Buzzer
          </Button>
        </div>

        <div className="home-page-row">
          <CircularProgress value={potValue} size="150px" color="green.400">
            <CircularProgressLabel>
              <h1> {potValue}%</h1>
            </CircularProgressLabel>
          </CircularProgress>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
