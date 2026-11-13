package com.medshare.web;

import com.medshare.config.WebConfig;
import com.medshare.model.AppUser;
import com.medshare.repo.UserRepo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepo users;
    private final PasswordEncoder encoder;

    public AuthController(UserRepo users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    public record RegisterBody(String clinicName, String contactPerson, String username,
                               String password, String phone, String address, String city) {}

    public record LoginBody(String username, String password) {}

    /** Clinic self-registration. The account stays PENDING until an admin approves it. */
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody RegisterBody body) {
        String clinicName = required(body.clinicName(), "Clinic name");
        String contactPerson = required(body.contactPerson(), "Contact person");
        String username = required(body.username(), "Username");
        String password = required(body.password(), "Password");
        String phone = required(body.phone(), "Phone");
        String city = required(body.city(), "City");

        if (username.length() < 3 || !username.matches("[A-Za-z0-9._-]+")) {
            throw ApiException.badRequest("Username must be at least 3 characters (letters, numbers, dot, dash, underscore only).");
        }
        if (password.length() < 6) {
            throw ApiException.badRequest("Password must be at least 6 characters.");
        }
        if (users.existsByUsername(username)) {
            throw ApiException.conflict("Username '" + username + "' is already taken. Choose another.");
        }

        users.insertClinic(username, encoder.encode(password), clinicName, contactPerson, phone, body.address(), city);
        return Map.of("message",
                "Registration successful! Your clinic is awaiting admin approval before you can sign in.");
    }

    /** Sign in for both roles. Pending or rejected clinics cannot sign in. */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginBody body, HttpServletRequest request) {
        String username = required(body.username(), "Username");
        String password = required(body.password(), "Password");

        AppUser user = users.findByUsername(username)
                .orElseThrow(() -> ApiException.badRequest("Invalid username or password."));

        if (!encoder.matches(password, user.passwordHash())) {
            throw ApiException.badRequest("Invalid username or password.");
        }

        if (AppUser.ROLE_CLINIC.equals(user.role())) {
            if ("PENDING".equals(user.status())) {
                throw ApiException.forbidden(
                        "Your clinic registration is still awaiting admin approval. Please try again later.");
            }
            if ("REJECTED".equals(user.status())) {
                throw ApiException.forbidden("Your clinic registration was rejected by the admin.");
            }
        }

        HttpSession session = request.getSession(true);
        session.setAttribute(WebConfig.SESSION_USER_ID, user.id());
        session.setAttribute(WebConfig.SESSION_ROLE, user.role());
        session.setAttribute("username", user.username());

        return Map.of(
                "message", "Signed in as " + user.username(),
                "role", user.role(),
                "user", user.withoutSecrets());
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return Map.of("message", "Signed out.");
    }

    /** Used by protected pages on load to decide whether the visitor may stay. */
    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute(WebConfig.SESSION_USER_ID) == null) {
            return Map.of("authenticated", false);
        }
        Long userId = (Long) session.getAttribute(WebConfig.SESSION_USER_ID);
        AppUser user = users.findById(userId)
                .map(AppUser::withoutSecrets)
                .orElse(null);
        if (user == null) {
            session.invalidate();
            return Map.of("authenticated", false);
        }
        return Map.of("authenticated", true, "user", user);
    }

    private static String required(String value, String field) {
        if (value == null || value.isBlank()) {
            throw ApiException.badRequest(field + " is required.");
        }
        return value.trim();
    }
}
