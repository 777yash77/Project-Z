package com.employee.system.controller;

import java.time.LocalDate;
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
import com.employee.system.entity.Organization;
import com.employee.system.entity.TradingWindowConfig;
import com.employee.system.entity.TransferRequest;
import com.employee.system.entity.User;
import com.employee.system.repository.EmployeeRepository;
import com.employee.system.repository.OrganizationRepository;
import com.employee.system.repository.UserRepository;
import com.employee.system.service.TradingRuleEngineService;

@RestController
@RequestMapping("/api/trading")
@CrossOrigin(origins = "*")
public class TradingWindowController {

    private final TradingRuleEngineService tradingService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;

    public TradingWindowController(TradingRuleEngineService tradingService,
                                   UserRepository userRepository,
                                   EmployeeRepository employeeRepository,
                                   OrganizationRepository organizationRepository) {
        this.tradingService = tradingService;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
    }

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext() == null || SecurityContextHolder.getContext().getAuthentication() == null) return null;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) return null;
        return userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);
    }

    @PostMapping("/config")
    public ResponseEntity<?> saveConfig(@RequestBody Map<String, Object> payload) {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Organisation role required"));
        }

        TradingWindowConfig config = new TradingWindowConfig();
        config.setOrganization(current.getOrganization());
        config.setStartDate(LocalDate.parse((String) payload.get("startDate")));
        config.setEndDate(LocalDate.parse((String) payload.get("endDate")));
        if (payload.get("freezeStartDate") != null && !((String) payload.get("freezeStartDate")).isBlank()) {
            config.setFreezeStartDate(LocalDate.parse((String) payload.get("freezeStartDate")));
        }
        if (payload.get("freezeEndDate") != null && !((String) payload.get("freezeEndDate")).isBlank()) {
            config.setFreezeEndDate(LocalDate.parse((String) payload.get("freezeEndDate")));
        }
        config.setMinTenureMonths(((Number) payload.getOrDefault("minTenureMonths", 6)).intValue());
        config.setMinPerformanceRating(((Number) payload.getOrDefault("minPerformanceRating", 3.0)).doubleValue());
        config.setNoticePeriodDays(((Number) payload.getOrDefault("noticePeriodDays", 30)).intValue());
        config.setActive(Boolean.TRUE.equals(payload.getOrDefault("active", true)));

        return ResponseEntity.ok(tradingService.saveConfig(config));
    }

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) return ResponseEntity.ok(Map.of());
        TradingWindowConfig config = tradingService.getActiveConfig(current.getOrganization());
        return ResponseEntity.ok(config != null ? config : Map.of());
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluate(@RequestBody Map<String, Long> payload) {
        Long employeeId = payload.get("employeeId");
        Long targetOrgId = payload.get("targetOrgId");
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        Organization targetOrg = organizationRepository.findById(targetOrgId).orElse(null);
        if (emp == null || targetOrg == null) return ResponseEntity.badRequest().build();

        return ResponseEntity.ok(tradingService.evaluateTransferEligibility(emp, targetOrg));
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> payload) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long employeeId = ((Number) payload.get("employeeId")).longValue();
        Long targetOrgId = ((Number) payload.get("targetOrgId")).longValue();
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        Organization targetOrg = organizationRepository.findById(targetOrgId).orElse(null);
        if (emp == null || targetOrg == null) return ResponseEntity.badRequest().build();

        String targetDept = (String) payload.get("targetDepartment");
        String targetDesig = (String) payload.get("targetDesignation");
        String reason = (String) payload.get("reason");

        TransferRequest req = tradingService.createTransferRequest(emp, targetOrg, targetDept, targetDesig, reason, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(req);
    }

    @GetMapping("/requests")
    public ResponseEntity<?> getRequests() {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(tradingService.getTransferRequestsForOrg(current.getOrganization()));
    }

    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveStep(@PathVariable Long id) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        TransferRequest req = tradingService.approveTransferStep(id, null, current);
        return ResponseEntity.ok(req);
    }
}
