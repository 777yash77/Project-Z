package com.employee.system.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.system.entity.Organization;
import com.employee.system.entity.User;
import com.employee.system.repository.OrganizationRepository;
import com.employee.system.repository.UserRepository;
import com.employee.system.security.JwtUtil;
import com.employee.system.service.EmailService;
import com.employee.system.service.OtpStore;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpStore otpStore;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository,
                          OrganizationRepository organizationRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          OtpStore otpStore,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpStore = otpStore;
        this.emailService = emailService;
    }

    // ─── Legacy endpoints (kept for backward compatibility) ──────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");
        String organizationName = payload.getOrDefault("organizationName",
                payload.getOrDefault("organization", "Default HR Group"));

        if (username == null || email == null || password == null
                || username.isBlank() || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Username, email and password are required"));
        }
        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "User already exists"));
        }

        User savedUser = createAndSaveUser(username, email, password, organizationName);
        Organization org = savedUser.getOrganization();

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("username", savedUser.getUsername());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());
        response.put("organization", org != null ? org.getName() : null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String usernameOrEmail = payload.getOrDefault("usernameOrEmail",
                payload.getOrDefault("username", "")).trim();
        String password = payload.get("password");
        if (usernameOrEmail.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Username/email and password are required"));
        }
        User user = findUser(usernameOrEmail);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username/email or password"));
        }
        return ResponseEntity.ok(buildTokenResponse(user));
    }

    // ─── Step 1: Send OTP ────────────────────────────────────────────────────

    /**
     * POST /api/auth/send-otp
     * Body: { "email": "user@example.com", "purpose": "LOGIN" | "REGISTER" }
     *
     * For LOGIN: also pre-validates that the email exists in the system.
     * For REGISTER: just sends an OTP to verify the address before account creation.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> payload) {
        String email  = payload.getOrDefault("email", "").trim().toLowerCase();
        String purpose = payload.getOrDefault("purpose", "").toUpperCase();

        if (email.isBlank() || (!purpose.equals("LOGIN") && !purpose.equals("REGISTER"))) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Valid email and purpose (LOGIN or REGISTER) are required"));
        }

        if (purpose.equals("LOGIN")) {
            // For login we need to validate credentials first (password was sent too)
            String password = payload.getOrDefault("password", "");
            String usernameOrEmail = payload.getOrDefault("usernameOrEmail", email);
            User user = findUser(usernameOrEmail);
            if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials"));
            }
            // Use the user's actual email for OTP
            email = user.getEmail().toLowerCase();
        }

        if (purpose.equals("REGISTER")) {
            String username = payload.getOrDefault("username", "");
            if (!username.isBlank() && userRepository.existsByUsername(username)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username already taken"));
            }
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email already registered"));
            }
        }

        String otp = otpStore.generate(email, purpose);
        emailService.sendOtp(email, otp, purpose);

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to " + maskEmail(email),
                "maskedEmail", maskEmail(email)
        ));
    }

    // ─── Step 2a: Verify OTP → Complete Login ────────────────────────────────

    /**
     * POST /api/auth/verify-login
     * Body: { "usernameOrEmail": "...", "password": "...", "otp": "123456" }
     */
    @PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody Map<String, String> payload) {
        String usernameOrEmail = payload.getOrDefault("usernameOrEmail", "").trim();
        String password = payload.getOrDefault("password", "");
        String otp = payload.getOrDefault("otp", "").trim();

        if (usernameOrEmail.isBlank() || password.isBlank() || otp.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "usernameOrEmail, password and otp are required"));
        }

        User user = findUser(usernameOrEmail);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }

        if (!otpStore.verify(user.getEmail(), otp, "LOGIN")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        return ResponseEntity.ok(buildTokenResponse(user));
    }

    // ─── Step 2b: Verify OTP → Complete Registration ─────────────────────────

    /**
     * POST /api/auth/verify-register
     * Body: { "username":"...", "email":"...", "password":"...", "organizationName":"...", "otp":"123456" }
     */
    @PostMapping("/verify-register")
    public ResponseEntity<?> verifyRegister(@RequestBody Map<String, String> payload) {
        String username         = payload.getOrDefault("username", "").trim();
        String email            = payload.getOrDefault("email", "").trim().toLowerCase();
        String password         = payload.getOrDefault("password", "");
        String organizationName = payload.getOrDefault("organizationName",
                payload.getOrDefault("organization", "Default HR Group"));
        String otp              = payload.getOrDefault("otp", "").trim();

        if (username.isBlank() || email.isBlank() || password.isBlank() || otp.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "All fields are required"));
        }

        if (!otpStore.verify(email, otp, "REGISTER")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired OTP. Please request a new one."));
        }

        // Double-check uniqueness (in case another request raced ahead)
        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username or email already registered"));
        }

        User savedUser = createAndSaveUser(username, email, password, organizationName);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildTokenResponse(savedUser));
    }

    // ─── Token Validation ────────────────────────────────────────────────────

    /**
     * GET /api/auth/me
     * Returns the current user's profile based on the JWT in the Authorization header.
     * Used by the frontend for auto-login on page load.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }
        Organization org = user.getOrganization();
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("organization", org != null ? org.getName() : null);
        return ResponseEntity.ok(response);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private User findUser(String usernameOrEmail) {
        return userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElse(null);
    }

    private User createAndSaveUser(String username, String email, String password, String organizationName) {
        Organization organization = organizationRepository.findByName(organizationName)
                .orElseGet(() -> {
                    Organization org = new Organization();
                    org.setName(organizationName);
                    org.setIndustry("HR Services");
                    org.setLocation("Global");
                    return organizationRepository.save(org);
                });

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("HR");
        user.setOrganization(organization);
        return userRepository.save(user);
    }

    private Map<String, Object> buildTokenResponse(User user) {
        String token = jwtUtil.generateToken(user.getUsername());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("organization", user.getOrganization() != null
                ? user.getOrganization().getName() : null);
        return response;
    }

    /** Masks email for display: j***@example.com */
    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) return email;
        return email.charAt(0) + "***" + email.substring(at);
    }
}
