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
import { Line } from 'react-chartjs-2'; //
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import "./HomePage.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HomePage = () => {
  const username = "admin";
  const [data, setData] = useState();
  const [mqttClient, setMqttClient] = useState(null);
  const [potValue, setPotValue] = useState(0);
  const [led1, setLed1] = useState(false);
  const [led2, setLed2] = useState(false);
  const [temperatureData, setTemperatureData] = useState([31.8, 30.40, 32.2, 31.9, 32.1, 32.3]); //
  const [humidityData, setHumidityData] = useState([75, 76, 78, 77, 79, 80]);  //
  const [currentTemperature, setCurrentTemperature] = useState(32.3); // Nhiệt độ hiện tại
  const [currentHumidity, setCurrentHumidity] = useState(80); // Độ ẩm hiện tại

  const onBuzzerClick = async () => {
    const buzzerName = "buzzer";
    try {
      const response = await fetch(
        `http://localhost:8080/api/led/on?name=${buzzerName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      // Kiểm tra phản hồi trả về
      if (response.ok) {
        const data = await response.text(); // Đọc dữ liệu trả về dưới dạng chuỗi
        console.log("API Response:", data);
      } else {
        console.error("API Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  
    // Chờ 2 giây và tắt buzzer
    setTimeout(async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/led/off?name=${buzzerName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        // Kiểm tra phản hồi trả về
        if (response.ok) {
          const data = await response.text(); // Đọc dữ liệu trả về dưới dạng chuỗi
          console.log("API Response:", data);
        } else {
          console.error("API Error:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }, 2000);
  };  
/*
  const onBuzzerClick = () => {
    sendMessage("buzzer on", "USER");
    setTimeout(() => {
      sendMessage("buzzer off", "USER");
    }, 500);
  };
*/
  useEffect(() => {
    const client = mqtt.connect("ws://192.168.0.109:9001");
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
        try {
          const payload = JSON.parse(message.toString());
          console.log(payload);
      
          if (payload?.name === "potentiometer") {
            // Chuyển đổi giá trị từ chuỗi sang số trước khi cập nhật
            const potValue = parseFloat(payload.value);
            if (!isNaN(potValue)) {
              setPotValue(potValue); // Cập nhật giá trị của potentiometer
            } else {
              console.warn("Invalid potentiometer value:", payload.value);
            }
          } else if (payload?.name === "dht11") {
            // Chuyển đổi dữ liệu nhiệt độ và độ ẩm từ chuỗi sang số
            const temperature = parseFloat(payload.temperature);
            const humidity = parseFloat(payload.humidity);
      
            if (!isNaN(temperature)) {
              setTemperatureData((prevData) => [...prevData, temperature].slice(-6)); // Lấy 6 điểm cuối
              setCurrentTemperature(temperature); // Cập nhật nhiệt độ hiện tại
            }
            if (!isNaN(humidity)) {
              setHumidityData((prevData) => [...prevData, humidity].slice(-6)); // Lấy 6 điểm cuối
              setCurrentHumidity(humidity); // Cập nhật độ ẩm hiện tại
            }
          } else {
            console.warn("Received message from unsupported device:", payload.name);
          }
        } catch (error) {
          console.error("Failed to process message:", error);
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

  const handleLed1Change = async () => {
    const ledName = "led1";
  
    // Đảo trạng thái của Switch
    setLed1((prev) => !prev);
  
    try {
      const response = await fetch(
        `http://localhost:8080/api/led/${led1 ? "off" : "on"}?name=${ledName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      // Kiểm tra phản hồi trả về
      if (response.ok) {
        const data = await response.text(); // Đọc dữ liệu trả về dưới dạng chuỗi
        console.log("API Response:", data);
      } else {
        console.error("API Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
      setLed1((prev) => !prev); // Hoàn tác trạng thái nếu có lỗi
    }
  };
  

  const handleLed2Change = async () => {
    const ledName = "led2";
  
    // Đảo trạng thái của Switch
    setLed2((prev) => !prev);
  
    try {
      const response = await fetch(
        `http://localhost:8080/api/led/${led2 ? "off" : "on"}?name=${ledName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      // Kiểm tra phản hồi trả về
      if (response.ok) {
        const data = await response.text(); // Đọc dữ liệu trả về dưới dạng chuỗi
        console.log("API Response:", data);
      } else {
        console.error("API Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
      setLed2((prev) => !prev); // Hoàn tác trạng thái nếu có lỗi
    }
  };
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Cập nhật biểu đồ sau mỗi 1 giờ (60 phút)
      if (temperatureData.length > 0 || humidityData.length > 0) {
        setTemperatureData([...temperatureData]); // Làm mới dữ liệu biểu đồ
        setHumidityData([...humidityData]); // Làm mới dữ liệu biểu đồ
      }
    }, 600000); // 3600000 ms = 1 giờ

    return () => clearInterval(intervalId); // Dọn dẹp khi component unmount
  }, [temperatureData, humidityData]);

  const temperatureChartData = {
    labels: Array(temperatureData.length).fill(''), // Tạo labels trống cho mỗi điểm
    datasets: [
      {
        label: 'Nhiệt độ (°C)',
        data: temperatureData,
        borderColor: 'rgb(255, 99, 132)', // Màu cho đường biểu đồ Nhiệt độ
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Màu nền cho biểu đồ Nhiệt độ
        fill: true,
      },
    ],
  };

  const humidityChartData = {
    labels: Array(humidityData.length).fill(''), // Tạo labels trống cho mỗi điểm
    datasets: [
      {
        label: 'Độ ẩm (%)',
        data: humidityData,
        borderColor: 'rgb(54, 162, 235)', // Màu cho đường biểu đồ Độ ẩm
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Màu nền cho biểu đồ Độ ẩm
        fill: true,
      },
    ],
  };

  return (
    <div className="home-page-row" style={{ margin: 250 }}>
      <table>
        <tbody>
          <tr>
            <td>
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
            isChecked={led1}
            onChange={handleLed1Change}
            size="lg"
          />
        </div>
        <div className="home-page-row">
          <MdLightbulb size={25} />
          <h1 className="home-page-label" htmlFor="isChecked2">
            Led
          </h1>
          <Switch
            isChecked={led2}
            onChange={handleLed2Change}
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
            </td>
            <td>
              <div style={{ width: '100%', marginLeft: '20px' }}>
                <h2>Biểu đồ Nhiệt độ</h2>
                <div style={{ width: '100%', height: '250px' }}>
                  <Line data={temperatureChartData} options={{ responsive: true }} />
                </div>

                <h2>Biểu đồ Độ ẩm</h2>
                <div style={{ width: '100%', height: '250px' }}>
                  <Line data={humidityChartData} options={{ responsive: true }} />
                </div>
              </div>
            </td>
            <td>
              <div className="home-page-row" style={{ flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <h2>Nhiệt Độ Hiện Tại</h2>
                {/* CircularProgress hiển thị nhiệt độ hiện tại */}
                <CircularProgress
                  value={currentTemperature || 0}
                  max={50}
                  size="150px"
                  color="rgb(0, 255, 163)"
                  thickness="12px"
                >
                  <CircularProgressLabel style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {currentTemperature !== null ? `${currentTemperature}°C` : "N/A"}
                  </CircularProgressLabel>
                </CircularProgress>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2>Độ Ẩm Hiện Tại</h2>
                <CircularProgress
                  value={currentHumidity || 0}
                  max={100}
                  size="150px"
                  color="rgb(43, 187, 255)"
                  thickness="12px"
                >
                  <CircularProgressLabel style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {currentHumidity !== null ? `${currentHumidity}%` : "N/A"}
                  </CircularProgressLabel>
                </CircularProgress>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default HomePage;
