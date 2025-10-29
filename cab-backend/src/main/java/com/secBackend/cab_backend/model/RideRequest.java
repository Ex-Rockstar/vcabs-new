package com.secBackend.cab_backend.model;

import com.secBackend.cab_backend.enumerations.RideType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
public class RideRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String pickUpLocation;

    @Column(nullable = false)
    private String destinationLocation;

    private double pickUpLatitude;
    private double pickUpLongitude;
    private double destinationLatitude;
    private double destinationLongitude;
    private int fare;
    private double distanceKm;
    private int durationMinutes;

    @Enumerated(EnumType.STRING)
    private RideStatus status;

    @Enumerated(EnumType.STRING)
    private RideType rideType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private User driver;
    private LocalDateTime requestedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime scheduledTime;
    private int rentalHours;

    public enum RideStatus {
        REQUESTED,
        ACCEPTED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
