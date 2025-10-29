package com.secBackend.cab_backend.service;

import com.secBackend.cab_backend.Util.GeoUtil;
import com.secBackend.cab_backend.dataTransferObject.RideRequestDto;
import com.secBackend.cab_backend.dataTransferObject.RideResponseDto;
import com.secBackend.cab_backend.dataTransferObject.RouteResult;
import com.secBackend.cab_backend.dataTransferObject.DriverLocation;
import com.secBackend.cab_backend.enumerations.RideType;
import com.secBackend.cab_backend.enumerations.Role;
import com.secBackend.cab_backend.model.RideRequest;
import com.secBackend.cab_backend.model.User;
import com.secBackend.cab_backend.repository.RideRequestRepository;
import com.secBackend.cab_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RideRequestService {

    private final RideRequestRepository rideRequestRepository;
    private final RouteService routeService;
    private final UserRepository userRepository;
    private final CabLocationService cabLocationService;

    public RideRequestService(RideRequestRepository rideRequestRepository,
                              RouteService routeService,
                              UserRepository userRepository,
                              CabLocationService cabLocationService) {
        this.rideRequestRepository = rideRequestRepository;
        this.routeService = routeService;
        this.userRepository = userRepository;
        this.cabLocationService = cabLocationService;
    }


//public ResponseEntity<?> createRide(RideRequestDto rideRequestDto, String email) {
//
//
//    // 1. Calculate route details
//    RouteResult route = routeService.getRoute(
//            rideRequestDto.getPickUpLongitude(),
//            rideRequestDto.getPickUpLatitude(),
//            rideRequestDto.getDropOffLongitude(),
//            rideRequestDto.getDropOffLatitude()
//    );
//
//    if(route.getDistanceKm()>25){
//        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                .body(Map.of("message", "can't book Local rides more than 25 Km."));
//
//    }
//
//    // 2. Estimate fare
//    double baseFare;
//    switch (rideRequestDto.getCabType().toUpperCase()) {
//        case "SEDAN" -> baseFare = 15;
//        case "SUV" -> baseFare = 20;
//        default -> baseFare = 10; // MINI
//    }
//    double estimatedFare = baseFare * route.getDistanceKm();
//
//    // 3. Validate customer
//    User customer = userRepository.findByEmail(email)
//            .orElseThrow(() -> new RuntimeException("User not found"));
//    List<RideRequest> checkCustomerAlreadyInRide=rideRequestRepository.findAllByUser_Id(customer.getId());
//    boolean hasActiveRide=checkCustomerAlreadyInRide.stream().
//            anyMatch(r->
//                    r.getStatus()==RideRequest.RideStatus.ACCEPTED||
//                    r.getStatus()==RideRequest.RideStatus.IN_PROGRESS
//            );
//
//    if (hasActiveRide) {
//        throw new RuntimeException("You already have an active ride!");
//    }
//
//
//    // 4. Create ride request object
//    RideRequest rideRequest = new RideRequest();
//    rideRequest.setPickUpLocation(rideRequestDto.getPickUpLocation());
//    rideRequest.setDestinationLocation(rideRequestDto.getDropOffLocation());
//    rideRequest.setPickUpLatitude(rideRequestDto.getPickUpLatitude());
//    rideRequest.setPickUpLongitude(rideRequestDto.getPickUpLongitude());
//    rideRequest.setDestinationLatitude(rideRequestDto.getDropOffLatitude());
//    rideRequest.setDestinationLongitude(rideRequestDto.getDropOffLongitude());
//    rideRequest.setDistanceKm(route.getDistanceKm());
//    rideRequest.setDurationMinutes((int) route.getDurationMinutes());
//    rideRequest.setFare((int) estimatedFare);
//    rideRequest.setRequestedAt(LocalDateTime.now());
//    rideRequest.setUser(customer);
//
//    // 5. Try to auto-assign the nearest available driver
//    Optional<User> nearestDriver = findNearestAvailableDriver(
//            rideRequestDto.getPickUpLatitude(),
//            rideRequestDto.getPickUpLongitude(),
//            5 // max distance in km
//    );
//
//    if (nearestDriver.isEmpty()) {
//        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                .body(Map.of("message", "No driver available right now. Please try again later."));
//    }
//
//    rideRequest.setStatus(RideRequest.RideStatus.ACCEPTED);
//    rideRequest.setDriver(nearestDriver.get());
//    rideRequest.setAcceptedAt(LocalDateTime.now());
//
//    // 6. Save and return response
//    RideRequest saved = rideRequestRepository.save(rideRequest);
//
//    RideResponseDto response = new RideResponseDto();
//    response.setRideId(saved.getId());
//    response.setDistance(saved.getDistanceKm());
//    response.setDurationMinutes(saved.getDurationMinutes());
//    response.setFare(saved.getFare());
//    response.setStatus(saved.getStatus().name());
//
//    return ResponseEntity.ok(response);
//}

    public ResponseEntity<?> createRide(RideRequestDto dto, String email) {

        // 1️⃣ Validate user
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2️⃣ Determine ride type
        RideType rideType = RideType.valueOf(dto.getRideType().toUpperCase());

        // 3️⃣ Handle ride type-specific validation
        RouteResult route = routeService.getRoute(
                dto.getPickUpLongitude(), dto.getPickUpLatitude(),
                dto.getDropOffLongitude(), dto.getDropOffLatitude()
        );

        double distance = route.getDistanceKm();
        double duration = route.getDurationMinutes();

        if (rideType == RideType.LOCAL && distance > 25) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Local rides cannot exceed 25 km."));
        }

        if (rideType == RideType.INTERCITY && distance < 25) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Intercity rides must exceed 25 km."));
        }

        if (rideType == RideType.ADVANCE && dto.getScheduledTime() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Scheduled time required for advance booking."));
        }

        if (rideType == RideType.RENTAL && dto.getRentalHours() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Please specify valid rental hours."));
        }

        // 4️⃣ Fare calculation
        double baseFare;
        switch (dto.getCabType().toUpperCase()) {
            case "SEDAN" -> baseFare = 15;
            case "SUV" -> baseFare = 20;
            default -> baseFare = 10;
        }

        double estimatedFare = switch (rideType) {
            case LOCAL -> baseFare * distance;
            case INTERCITY -> (baseFare * distance) + 100; // intercity toll etc.
            case ADVANCE -> (baseFare * distance) * 1.1;   // small booking fee
            case RENTAL -> baseFare * dto.getRentalHours() * 15; // hourly package
        };

        // 5️⃣ Create Ride entity
        RideRequest rideRequest = new RideRequest();
        rideRequest.setRideType(rideType);
        rideRequest.setPickUpLocation(dto.getPickUpLocation());
        rideRequest.setDestinationLocation(dto.getDropOffLocation());
        rideRequest.setPickUpLatitude(dto.getPickUpLatitude());
        rideRequest.setPickUpLongitude(dto.getPickUpLongitude());
        rideRequest.setDestinationLatitude(dto.getDropOffLatitude());
        rideRequest.setDestinationLongitude(dto.getDropOffLongitude());
        rideRequest.setDistanceKm(distance);
        rideRequest.setDurationMinutes((int) duration);
        rideRequest.setFare((int) estimatedFare);
        rideRequest.setRequestedAt(LocalDateTime.now());
        rideRequest.setUser(customer);
        rideRequest.setRentalHours(dto.getRentalHours());
        rideRequest.setScheduledTime(dto.getScheduledTime());

        // 6️⃣ Auto assign driver only for immediate rides
        if (rideType == RideType.ADVANCE) {
            rideRequest.setStatus(RideRequest.RideStatus.REQUESTED); // Wait for later assignment
        } else {
            Optional<User> nearestDriver = findNearestAvailableDriver(
                    dto.getPickUpLatitude(), dto.getPickUpLongitude(), 5);

            if (nearestDriver.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "No driver available now."));
            }

            rideRequest.setDriver(nearestDriver.get());
            rideRequest.setAcceptedAt(LocalDateTime.now());
            rideRequest.setStatus(RideRequest.RideStatus.ACCEPTED);
        }

        RideRequest saved = rideRequestRepository.save(rideRequest);

        RideResponseDto response = new RideResponseDto();
        response.setRideId(saved.getId());
        response.setDistance(saved.getDistanceKm());
        response.setDurationMinutes(saved.getDurationMinutes());
        response.setFare(saved.getFare());
        response.setStatus(saved.getStatus().name());

        return ResponseEntity.ok(response);
    }


    private Optional<User> findNearestAvailableDriver(double lat, double lon, double maxKm) {
        return userRepository.findAllByRole(Role.DRIVER).stream()
                // must have driver profile and marked available
                .filter(d -> d.getDriverProfile() != null && d.getDriverProfile().isAvailable())
                // must have valid location
                .map(d -> {
                    DriverLocation loc = cabLocationService.getLocation(d.getId());
                    return loc != null ? Map.entry(d, loc) : null;
                })
                .filter(entry->entry != null)
                // skip drivers already on an active ride
                .filter(entry -> rideRequestRepository.findAllByDriver_Id(entry.getKey().getId()).stream()
                        .noneMatch(r -> r.getStatus() == RideRequest.RideStatus.ACCEPTED ||
                                r.getStatus() == RideRequest.RideStatus.IN_PROGRESS))
                // ensure within maxKm
                .filter(entry -> GeoUtil.distanceInKm(
                        lat, lon,
                        entry.getValue().getLatitude(), entry.getValue().getLongitude()
                ) <= maxKm)
                // find the nearest driver
                .min(Comparator.comparingDouble(entry ->
                        GeoUtil.distanceInKm(lat, lon,
                                entry.getValue().getLatitude(), entry.getValue().getLongitude())
                ))
                .map(entry->entry.getKey()); // return only the driver
    }
}
