package com.secBackend.cab_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.secBackend.cab_backend.exception.InvalidPasswordException;
import com.secBackend.cab_backend.exception.UserAlreadyExistsException;
import com.secBackend.cab_backend.exception.UserNotFoundException;
import com.secBackend.cab_backend.Util.JwtUtil;
import com.secBackend.cab_backend.dataTransferObject.LoginRequest;
import com.secBackend.cab_backend.dataTransferObject.RegisterUserRequest;
import com.secBackend.cab_backend.model.User;
import com.secBackend.cab_backend.service.AuthService;
import com.secBackend.cab_backend.service.OtpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    // Constructor injection
    public AuthController(AuthService authService, BCryptPasswordEncoder bCryptPasswordEncoder, JwtUtil jwtUtil, OtpService otpService) {
        this.authService = authService;
        this.passwordEncoder = bCryptPasswordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
    }

    // User Registration
//    @PostMapping("/register")
//    public ResponseEntity<?> registerUser(@RequestPart RegisterUserRequest registerUserRequest, @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
//        System.out.println("registerUser"+registerUserRequest);
//        if(authService.findEmail(registerUserRequest.getEmail()).isPresent() ||
//                authService.findPhonenumber(registerUserRequest.getPhoneNumber()).isPresent()
//        ){
//            throw new UserAlreadyExistsException("Email or Phone number already exists!");
//        }
//        return ResponseEntity.status(HttpStatus.OK).body(authService.registerUser(registerUserRequest,imageFile));
//    }
    // JSON registration (Angular default)
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUser(@RequestBody RegisterUserRequest registerUserRequest) {
        if(authService.findEmail(registerUserRequest.getEmail()).isPresent() ||
                authService.findPhonenumber(registerUserRequest.getPhoneNumber()).isPresent()
        ){
            throw new UserAlreadyExistsException("Email or Phone number already exists!");
        }
        // Enforce OTP verification for all roles
        boolean verified = otpService.verifyOtp(registerUserRequest.getEmail(), registerUserRequest.getOtp());
        if(!verified){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or missing OTP"));
        }
        return ResponseEntity.status(HttpStatus.OK).body(authService.registerUser(registerUserRequest));
    }

    // Multipart registration (optional image upload)
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerUserMultipart(
            @RequestParam("registerUserRequest") String registerUserRequestJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        RegisterUserRequest registerUserRequest = objectMapper.readValue(registerUserRequestJson, RegisterUserRequest.class);

        if(authService.findEmail(registerUserRequest.getEmail()).isPresent() ||
                authService.findPhonenumber(registerUserRequest.getPhoneNumber()).isPresent()
        ){
            throw new UserAlreadyExistsException("Email or Phone number already exists!");
        }
        boolean verified = otpService.verifyOtp(registerUserRequest.getEmail(), registerUserRequest.getOtp());
        if(!verified){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or missing OTP"));
        }
        return ResponseEntity.status(HttpStatus.OK).body(authService.registerUser(registerUserRequest,imageFile));
    }

    // User Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest){
        System.out.println("loginRequest"+loginRequest);
        Optional<User> existingUser = authService.findEmail(loginRequest.getEmail());
        if(existingUser.isEmpty()){
            throw new UserNotFoundException("Email not found!");
        }
        User dbUser = existingUser.get();
        if(!passwordEncoder.matches(loginRequest.getPassword(), dbUser.getPassword())){
            throw new InvalidPasswordException("Password does not match!");
        }
        // Generate JWT token
        String token = jwtUtil.generateToken(dbUser.getEmail(), dbUser.getRole());
        return ResponseEntity.status(HttpStatus.OK).body(Map.of(
                "token", token,
                "role", dbUser.getRole(),
                "email", dbUser.getEmail()
        ));
    }
}
