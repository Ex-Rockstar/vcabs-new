package com.secBackend.cab_backend.dataTransferObject;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RideResponseDto {
    private Long rideId;
    private String pickUpLocation;
    private String destinationLocation;
    private LocalDateTime ScheduledDateTime;
    private Double distance;
    private int durationMinutes;
    private int fare;
    private String status;
}
