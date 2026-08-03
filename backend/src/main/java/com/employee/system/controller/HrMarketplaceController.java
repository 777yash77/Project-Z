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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

@RestController
@RequestMapping("/api/hr")
@CrossOrigin(origins = "*")
public class HrMarketplaceController {
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final EmployeeRepository employeeRepository;
    private final TradeListingRepository tradeListingRepository;
    private final MessageRepository messageRepository;

    public HrMarketplaceController(UserRepository userRepository, OrganizationRepository organizationRepository,
                                   EmployeeRepository employeeRepository, TradeListingRepository tradeListingRepository,
                                   MessageRepository messageRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.employeeRepository = employeeRepository;
        this.tradeListingRepository = tradeListingRepository;
        this.messageRepository = messageRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("organization", user.getOrganization() != null ? user.getOrganization().getName() : null);
        return ResponseEntity.ok(response);
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
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || user.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Organization required"));
        }
        TradeListing listing = tradeListingRepository.findById(id).orElse(null);
        if (listing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        listing.setClaimedBy(user);
        listing.setStatus("CLAIMED");
        return ResponseEntity.ok(tradeListingRepository.save(listing));
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) return List.of();
        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(current.getId()))
                .filter(user -> user.getOrganization() != null && user.getOrganization().getId().equals(current.getOrganization().getId()))
                .toList();
    }

    @GetMapping("/messages")
    public List<Message> getMessages() {
        User user = getCurrentUser();
        if (user == null || user.getOrganization() == null) return List.of();
        return messageRepository.findBySenderOrRecipientOrderByCreatedAtAsc(user, user).stream()
                .filter(message -> message.getSender().getOrganization() != null
                        && message.getRecipient().getOrganization() != null
                        && message.getSender().getOrganization().getId().equals(user.getOrganization().getId())
                        && message.getRecipient().getOrganization().getId().equals(user.getOrganization().getId()))
                .toList();
    }

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User sender = userRepository.findByUsername(username).orElse(null);
        if (sender == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        Long recipientId = ((Number) payload.get("recipientId")).longValue();
        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(String.valueOf(payload.get("content")));
        return ResponseEntity.status(HttpStatus.CREATED).body(messageRepository.save(message));
    }
}
