package com.medishare.controller;

import com.medishare.entity.Organization;
import com.medishare.entity.User;
import com.medishare.repository.OrganizationRepository;
import com.medishare.repository.UserRepository;
import com.medishare.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ── Login ─────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }
        if (!user.getIsActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Account is deactivated"));
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        String orgName = null;
        String orgStatus = null;
        if (user.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(user.getOrganizationId()).orElse(null);
            if (org != null) {
                orgName = org.getName();
                orgStatus = org.getStatus().name();
            }
        }

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "role", user.getRole().name(),
                        "organizationId", user.getOrganizationId() != null ? user.getOrganizationId() : "",
                        "organizationName", orgName != null ? orgName : "",
                        "organizationStatus", orgStatus != null ? orgStatus : ""
                )
        ));
    }

    // ── Register ──────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        if (organizationRepository.existsByRegistrationNumber(req.getRegistrationNumber())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Organization registration number already exists"));
        }

        // Create organization
        Organization org = Organization.builder()
                .name(req.getOrganizationName())
                .type(Organization.OrgType.valueOf(req.getOrganizationType()))
                .registrationNumber(req.getRegistrationNumber())
                .licenceReference(req.getLicenceReference())
                .address(req.getAddress())
                .city(req.getCity())
                .state(req.getState())
                .zip(req.getZip())
                .storageType(Organization.StorageType.valueOf(req.getStorageType()))
                .contactName(req.getContactName())
                .contactLicence(req.getContactLicence())
                .email(req.getEmail())
                .status(Organization.OrgStatus.PENDING)
                .build();
        org = organizationRepository.save(org);

        // Create user
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getContactName())
                .role(User.Role.USER)
                .organizationId(org.getId())
                .isActive(true)
                .build();
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Registration submitted. Verification in progress."));
    }

    // ── Get Current User ──────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String orgName = null;
        String orgStatus = null;
        if (user.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(user.getOrganizationId()).orElse(null);
            if (org != null) {
                orgName = org.getName();
                orgStatus = org.getStatus().name();
            }
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole().name(),
                "organizationId", user.getOrganizationId() != null ? user.getOrganizationId() : "",
                "organizationName", orgName != null ? orgName : "",
                "organizationStatus", orgStatus != null ? orgStatus : ""
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    // ── DTOs ──────────────────────────────────────────────
    @Data
    public static class LoginRequest {
        @NotBlank @Email private String email;
        @NotBlank private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Email private String email;
        @NotBlank private String password;
        @NotBlank private String organizationName;
        @NotBlank private String organizationType;
        @NotBlank private String registrationNumber;
        private String licenceReference;
        @NotBlank private String address;
        @NotBlank private String city;
        @NotBlank private String state;
        @NotBlank private String zip;
        @NotBlank private String storageType;
        @NotBlank private String contactName;
        private String contactLicence;
    }
}
