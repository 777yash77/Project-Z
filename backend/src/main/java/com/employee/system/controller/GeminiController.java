package com.employee.system.controller;

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
import com.employee.system.entity.User;
import com.employee.system.repository.EmployeeRepository;
import com.employee.system.repository.UserRepository;
import com.employee.system.service.GeminiService;
import com.employee.system.service.RetentionRiskService;

@RestController
@RequestMapping("/api/gemini")
@CrossOrigin(origins = "*")
public class GeminiController {

    private final GeminiService geminiService;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RetentionRiskService retentionRiskService;

    public GeminiController(GeminiService geminiService, EmployeeRepository employeeRepository,
                            UserRepository userRepository, RetentionRiskService retentionRiskService) {
        this.geminiService = geminiService;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.retentionRiskService = retentionRiskService;
    }

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext() == null || SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) {
            return null;
        }
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElse(null);
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<?> getIndividualEmployeeAnalysis(@PathVariable Long id) {
        Employee emp = employeeRepository.findById(id).orElse(null);
        if (emp == null) {
            return ResponseEntity.notFound().build();
        }

        User currentUser = getCurrentUser();
        if (currentUser == null || emp.getCreatedBy() == null || !emp.getCreatedBy().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized to access this employee profile"));
        }

        Map<String, Object> riskDetails = retentionRiskService.predictRetentionRisk(emp);
        String report = geminiService.generateIndividualEmployeeAnalysis(emp, riskDetails);

        return ResponseEntity.ok(Map.of(
                "employeeId", emp.getId(),
                "employeeName", emp.getName(),
                "department", emp.getDepartment(),
                "riskLevel", emp.getRiskLevel(),
                "riskScore", emp.getRiskScore(),
                "aiAnalysisReport", report
        ));
    }

    @GetMapping("/workforce")
    public ResponseEntity<?> getWorkforceAnalytics() {
        User current = getCurrentUser();
        if (current == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Employee> employees = employeeRepository.findByCreatedByOrderByRiskScoreDesc(current);
        String report = geminiService.generateWorkforceAnalytics(employees, Map.of());

        return ResponseEntity.ok(Map.of(
                "totalEmployees", employees.size(),
                "aiWorkforceReport", report
        ));
    }

    @PostMapping("/insights")
    public ResponseEntity<?> generateInsights(@RequestBody Map<String, String> payload) {
        String prompt = payload.getOrDefault("prompt", "Provide executive employee retention insights for high attrition risks.");
        String result = geminiService.generateContent(prompt);

        Map<String, Object> response = new HashMap<>();
        if (result != null && !result.isBlank()) {
            response.put("source", "Google Gemini API (gemini-1.5-flash)");
            response.put("insight", result);
        } else {
            response.put("source", "HR Intelligence AI Engine (Fallback)");
            response.put("insight", "Workforce analytics indicate high risk concentrated in Engineering & Sales. Priority actions: 1) Execute stay interviews for engineers with >5 years tenure. 2) Review market compensation benchmarks against industry standard. 3) Initiate trade placement for high-performing, disengaged candidates.");
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/outreach-draft")
    public ResponseEntity<?> generateOutreachDraft(@RequestBody Map<String, String> payload) {
        String targetHr = payload.getOrDefault("targetHr", "HR Representative");
        String targetOrg = payload.getOrDefault("targetOrg", "Partner Company");
        String prompt = String.format("Write a professional, concise LinkedIn-style B2B HR outreach message to %s at %s proposing talent mobility, cross-organization recruiting, and retention risk sharing.", targetHr, targetOrg);

        String result = geminiService.generateContent(prompt);
        Map<String, Object> response = new HashMap<>();
        if (result != null && !result.isBlank()) {
            response.put("source", "Google Gemini API");
            response.put("draft", result);
        } else {
            response.put("source", "HR Intelligence AI Engine");
            response.put("draft", String.format("Hi %s! I'm reaching out from our organization to discuss potential talent mobility synergies with %s. We have open listings and would love to explore mutually beneficial recruitment opportunities. Let's connect!", targetHr, targetOrg));
        }
        return ResponseEntity.ok(response);
    }
}
