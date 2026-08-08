package com.employee.system.controller;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.system.entity.Employee;
import com.employee.system.entity.Message;
import com.employee.system.entity.Organization;
import com.employee.system.entity.TradeListing;
import com.employee.system.entity.User;
import com.employee.system.repository.EmployeeRepository;
import com.employee.system.repository.MessageRepository;
import com.employee.system.repository.OrganizationRepository;
import com.employee.system.repository.TradeListingRepository;
import com.employee.system.repository.UserRepository;
import com.employee.system.service.EmailService;

@RestController
@RequestMapping("/api/hr")
@CrossOrigin(origins = "*")
public class HrMarketplaceController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final EmployeeRepository employeeRepository;
    private final TradeListingRepository tradeListingRepository;
    private final MessageRepository messageRepository;
    private final EmailService emailService;
    private final com.employee.system.repository.ConnectionRequestRepository connectionRequestRepository;

    public HrMarketplaceController(UserRepository userRepository,
                                  OrganizationRepository organizationRepository,
                                  EmployeeRepository employeeRepository,
                                  TradeListingRepository tradeListingRepository,
                                  MessageRepository messageRepository,
                                  EmailService emailService,
                                  com.employee.system.repository.ConnectionRequestRepository connectionRequestRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.employeeRepository = employeeRepository;
        this.tradeListingRepository = tradeListingRepository;
        this.messageRepository = messageRepository;
        this.emailService = emailService;
        this.connectionRequestRepository = connectionRequestRepository;
    }

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext() == null || SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) {
            return null;
        }
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElse(null);
        if (user != null) {
            user.setLastActiveAt(java.time.LocalDateTime.now());
            try {
                userRepository.save(user);
            } catch (Exception ignored) {}
        }
        return user;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        Organization org = user.getOrganization();
        long totalEmployees = 0;
        if (org != null) {
            totalEmployees = employeeRepository.findAll().stream()
                    .filter(e -> e.getOrganization() != null && e.getOrganization().getId().equals(org.getId()))
                    .count();
        }
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
        response.put("hrCode", "HRC-" + String.format("%04d", user.getId()));
        if (org != null) {
            Map<String, Object> orgMap = new HashMap<>();
            orgMap.put("id", org.getId());
            orgMap.put("name", org.getName());
            orgMap.put("industry", org.getIndustry() != null ? org.getIndustry() : "Technology & Services");
            orgMap.put("location", org.getLocation() != null ? org.getLocation() : "Global HQ");
            orgMap.put("createdAt", org.getCreatedAt() != null ? org.getCreatedAt().toString() : "");
            response.put("organizationDetails", orgMap);
            response.put("organization", org.getName());
        }
        response.put("totalEmployees", totalEmployees);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> payload) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (payload.containsKey("avatarUrl")) {
            user.setAvatarUrl(payload.get("avatarUrl"));
        }
        if (payload.containsKey("role") && !payload.get("role").isBlank()) {
            user.setRole(payload.get("role"));
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "avatarUrl", saved.getAvatarUrl() != null ? saved.getAvatarUrl() : ""
        ));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User target = userRepository.findById(id).orElse(null);
        if (target == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        userRepository.delete(target);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @PutMapping("/organization")
    public ResponseEntity<?> updateOrganization(@RequestBody Map<String, String> payload) {
        User user = getCurrentUser();
        if (user == null || user.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Organization required"));
        }
        Organization org = user.getOrganization();
        if (payload.containsKey("name") && !payload.get("name").isBlank()) org.setName(payload.get("name").trim());
        if (payload.containsKey("location") && !payload.get("location").isBlank()) org.setLocation(payload.get("location").trim());
        if (payload.containsKey("industry") && !payload.get("industry").isBlank()) org.setIndustry(payload.get("industry").trim());
        Organization updated = organizationRepository.save(org);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/organizations")
    public ResponseEntity<Organization> createOrganization(@RequestBody Organization organization) {
        return ResponseEntity.status(HttpStatus.CREATED).body(organizationRepository.save(organization));
    }

    @GetMapping("/organizations")
    public List<Organization> getOrganizations() {
        return organizationRepository.findAll();
    }

    @GetMapping("/employees")
    public List<Employee> getMyEmployees() {
        User user = getCurrentUser();
        if (user == null || user.getOrganization() == null) return List.of();
        return employeeRepository.findAll().stream()
                .filter(employee -> employee.getOrganization() != null && employee.getOrganization().getId().equals(user.getOrganization().getId()))
                .filter(employee -> employee.getUser() == null || !employee.getUser().getId().equals(user.getId()))
                .sorted(Comparator.comparing(Employee::getRiskScore).reversed())
                .toList();
    }

    @PostMapping("/employees")
    public ResponseEntity<?> createEmployeeForOrg(@RequestBody Employee employee) {
        User user = getCurrentUser();
        if (user == null || user.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Organization required"));
        }
        employee.setOrganization(user.getOrganization());
        Employee saved = employeeRepository.save(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/trade-listings")
    public ResponseEntity<?> createTradeListing(@RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();
        if (user == null || user.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Organization required"));
        }
        Long employeeId = ((Number) payload.get("employeeId")).longValue();
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        if (employee.getOrganization() == null || !employee.getOrganization().getId().equals(user.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Employee must belong to your organization"));
        }

        TradeListing listing = new TradeListing();
        listing.setEmployee(employee);
        listing.setOrganization(user.getOrganization());
        listing.setListedBy(user);
        listing.setCommissionPercent(new BigDecimal(String.valueOf(payload.getOrDefault("commissionPercent", "0"))));
        listing.setNotes(String.valueOf(payload.getOrDefault("notes", "")));
        listing.setStatus("OPEN");
        return ResponseEntity.status(HttpStatus.CREATED).body(tradeListingRepository.save(listing));
    }

    @GetMapping("/trade-listings")
    public List<TradeListing> getTradeListings() {
        User user = getCurrentUser();
        if (user == null || user.getOrganization() == null) return List.of();
        return tradeListingRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(listing -> listing.getOrganization() != null && listing.getOrganization().getId().equals(user.getOrganization().getId()))
                .toList();
    }

    @PostMapping("/trade-listings/{id}/claim")
    public ResponseEntity<?> claimTradeListing(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user == null || user.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Organization required"));
        }
        TradeListing listing = tradeListingRepository.findById(id).orElse(null);
        if (listing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        listing.setClaimedBy(user);
        listing.setStatus("CLAIMED");
        return ResponseEntity.ok(tradeListingRepository.save(listing));
    }

    /** Returns all HR users across all partner organizations so HRs can search & message anyone */
    @GetMapping("/users")
    public List<User> getUsers() {
        User current = getCurrentUser();
        if (current == null) return List.of();
        
        List<com.employee.system.entity.ConnectionRequest> sentRequests = connectionRequestRepository.findBySender(current);
        java.util.Set<Long> requestedUserIds = sentRequests.stream().map(r -> r.getReceiver().getId()).collect(java.util.stream.Collectors.toSet());

        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(current.getId()))
                .map(user -> {
                    user.setConnectionRequested(requestedUserIds.contains(user.getId()));
                    boolean isFollowing = user.getFollowers().stream().anyMatch(f -> f.getId().equals(current.getId()));
                    user.setConnected(isFollowing);
                    return user;
                })
                .toList();
    }

    /** Returns all messages involving the current user */
    @GetMapping("/messages")
    public List<Message> getMessages() {
        User user = getCurrentUser();
        if (user == null) return List.of();
        return messageRepository.findBySenderOrRecipientOrderByCreatedAtAsc(user, user);
    }

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload) {
        User sender = getCurrentUser();
        if (sender == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not logged in"));
        }
        
        Object recipientObj = payload.get("recipientId");
        if (recipientObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "recipientId is required"));
        }
        
        Long recipientId;
        try {
            recipientId = Long.parseLong(String.valueOf(recipientObj));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid recipientId format"));
        }

        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Recipient HR user not found"));
        }

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(String.valueOf(payload.get("content")));
        Message saved = messageRepository.save(message);

        // Send email notification safely in background thread
        try {
            String senderOrg = sender.getOrganization() != null ? sender.getOrganization().getName() : "Partner Organization";
            if (recipient.getEmail() != null && !recipient.getEmail().isBlank()) {
                new Thread(() -> {
                    try {
                        emailService.sendChatNotificationEmail(
                                recipient.getEmail(), sender.getUsername(), senderOrg, saved.getContent()
                        );
                    } catch (Exception ignored) {}
                }).start();
            }
        } catch (Exception ignored) {}

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
