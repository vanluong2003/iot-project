package com.iot.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Led {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;
    private Instant timestamp;

    @Enumerated(EnumType.STRING)
    private LedStatus status;
    private long usedTotalTime;

    public Duration getUsedTotalTimeDuration() {
        return Duration.ofSeconds(this.usedTotalTime);
    }

    public void setUsedTotalTimeDuration(Duration duration) {
        this.usedTotalTime = duration.getSeconds();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public LedStatus getStatus() {
        return status;
    }

    public void setStatus(LedStatus status) {
        this.status = status;
    }
}
