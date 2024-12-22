package com.iot.backend.response;

public class ApiResponse {
    private String message;
    private Object data;

    // Constructor không tham số (nếu cần)
    public ApiResponse() {}

    // Constructor nhận tham số
    public ApiResponse(String message, Object data) {
        this.message = message;
        this.data = data;
    }

    // Getters và Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
