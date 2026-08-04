package com.employee.system.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.system.entity.AuditLog;
import com.employee.system.entity.Department;
import com.employee.system.entity.Designation;
import com.employee.system.entity.Organization;
import com.employee.system.entity.User;
import com.employee.system.repository.UserRepository;
import com.employee.system.service.OrganizationManagementService;

@RestController
@RequestMapping("/api/org")
@CrossOrigin(origins = "*")
public class OrganizationController {

    private final OrganizationManagementService orgService;
    private final UserRepository userRepository;

    public OrganizationController(OrganizationManagementService orgService, UserRepository userRepository) {
        this.orgService = orgService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext() == null || SecurityContextHolder.getContext().getAuthentication() == null) return null;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) return null;
        return userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);
    }

    @PostMapping("/hr")
    public ResponseEntity<?> createHrAccount(@RequestBody Map<String, String> payload) {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Organisation role required"));
        }
        String username = payload.get("username");
        String email = payload.get("email");
        if (username == null || email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "username and email are required"));
        }
        User created = orgService.createHrUser(current.getOrganization(), username, email, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/hr")
    public ResponseEntity<?> getHrAccounts() {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) {
            return ResponseEntity.ok(List.of());
        }
        List<User> hrs = orgService.getHrUsersForOrg(current.getOrganization());
        return ResponseEntity.ok(hrs);
    }

    @PutMapping("/hr/{id}/status")
    public ResponseEntity<?> updateHrStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String statusType = (String) payload.get("type"); // active, suspended, approved
        boolean value = Boolean.TRUE.equals(payload.get("value"));
        User updated = orgService.toggleHrStatus(id, statusType, value, current);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/hr/{id}/reset-password")
    public ResponseEntity<?> resetHrPassword(@PathVariable Long id) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String newPassword = orgService.resetHrPassword(id, current);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully", "temporaryPassword", newPassword));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(orgService.getAuditLogs());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(orgService.getDepartments(current.getOrganization()));
    }

    @PostMapping("/departments")
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, String> payload) {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Organisation role required"));
        }
        String name = payload.get("name");
        String code = payload.get("code");
        Department dept = orgService.createDepartment(current.getOrganization(), name, code, "Department created by org");
        return ResponseEntity.status(HttpStatus.CREATED).body(dept);
    }

    @GetMapping("/designations")
    public ResponseEntity<?> getDesignations() {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(orgService.getDesignations(current.getOrganization()));
    }

    @PostMapping("/designations")
    public ResponseEntity<?> createDesignation(@RequestBody Map<String, String> payload) {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        Designation desig = orgService.createDesignation(current.getOrganization(), null, payload.get("title"), payload.get("gradeLevel"));
        return ResponseEntity.status(HttpStatus.CREATED).body(desig);
    }
}
