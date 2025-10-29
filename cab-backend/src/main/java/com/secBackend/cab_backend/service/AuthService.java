package com.secBackend.cab_backend.service;

import com.secBackend.cab_backend.model.DriverProfile;
import com.secBackend.cab_backend.dataTransferObject.RegisterUserRequest;
import com.secBackend.cab_backend.enumerations.Role;
import com.secBackend.cab_backend.model.User;
import com.secBackend.cab_backend.repository.DriverProfileRepository;
import com.secBackend.cab_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final DriverProfileRepository driverRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private DriverProfile driverProfile;

    // Constructor injection
    public AuthService(UserRepository userRepo,
                       DriverProfileRepository driverRepo,
                       BCryptPasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.driverRepo = driverRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // Register a user (customer or driver)
    public ResponseEntity<?> registerUser(RegisterUserRequest registerUserRequest, MultipartFile imageFile) throws IOException {
        User user = new User();
        user.setUsername(registerUserRequest.getUserName());
        user.setEmail(registerUserRequest.getEmail());
        user.setPhoneNumber(registerUserRequest.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(registerUserRequest.getPassword()));
        user.setRole(Role.valueOf(registerUserRequest.getRole().toUpperCase()));

        // Save customer
        if(registerUserRequest.getDriverDetails() == null){
            userRepo.save(user);
        }

        // If registering a driver
        if(user.getRole() == Role.DRIVER && registerUserRequest.getDriverDetails() != null){
            Optional<DriverProfile> existingDriver = driverRepo.findByLicenseNumber(registerUserRequest.getDriverDetails().getLicenseNumber());
            if(existingDriver.isPresent()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Diving Licence Already Exist"));
            }
            existingDriver = driverRepo.findByVehicleNumber(registerUserRequest.getDriverDetails().getVehicleNumber());
            if(existingDriver.isPresent()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "vehicle already exist"));
            }

            driverProfile = new DriverProfile();
            driverProfile.setUser(user);
            driverProfile.setLicenseNumber(registerUserRequest.getDriverDetails().getLicenseNumber());
            driverProfile.setVehicleNumber(registerUserRequest.getDriverDetails().getVehicleNumber());
            driverProfile.setProfilePictureData(imageFile != null ? imageFile.getBytes() : null);

            userRepo.save(user);
            driverRepo.save(driverProfile);
        }

        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message",
                registerUserRequest.getRole() + " registered successfully!"));
    }

    // Overload to support JSON-only registration (no image upload)
    public ResponseEntity<?> registerUser(RegisterUserRequest registerUserRequest) {
        try {
            return registerUser(registerUserRequest, null);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing registration image", "error", e.getMessage()));
        }
    }

    // Find user by email
    public Optional<User> findEmail(String email) {
        return userRepo.findByEmail(email);
    }

    // Find user by phone number
    public Optional<User> findPhonenumber(String phoneNumber) {
        return userRepo.findByPhoneNumber(phoneNumber);
    }
}
