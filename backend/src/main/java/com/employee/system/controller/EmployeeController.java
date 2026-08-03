package com.employee.system.controller;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.employee.system.entity.Employee;
import com.employee.system.entity.User;
import com.employee.system.repository.EmployeeRepository;
import com.employee.system.repository.UserRepository;
import com.employee.system.service.RetentionRiskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RetentionRiskService retentionRiskService;

    public EmployeeController(EmployeeRepository employeeRepository, UserRepository userRepository,
                              RetentionRiskService retentionRiskService) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.retentionRiskService = retentionRiskService;
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@Valid @RequestBody Employee employee) {
        User user = getCurrentUser();
        if (user == null || user.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Organization required"));
        }
        employee.setOrganization(user.getOrganization());
        applyRisk(employee);
        Employee saved = employeeRepository.save(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        User user = getCurrentUser();
        if (user == null || user.getOrganization() == null) return List.of();
        return employeeRepository.findAll().stream()
                .filter(employee -> employee.getOrganization() != null && employee.getOrganization().getId().equals(user.getOrganization().getId()))
                .sorted(Comparator.comparing(Employee::getRiskScore).reversed())
                .toList();
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getEmployeeDetails(@PathVariable Long id) {
        Employee existing = employeeRepository.findById(id).orElse(null);
        User currentUser = getCurrentUser();
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (currentUser == null || currentUser.getOrganization() == null || existing.getOrganization() == null
                || !existing.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized"));
        }

        Map<String, Object> riskDetails = retentionRiskService.predictRetentionRisk(existing);
        return ResponseEntity.ok(Map.of(
                "employee", existing,
                "riskAnalysis", riskDetails
        ));
    }

    @PostMapping("/simulate")
    public ResponseEntity<?> simulateRisk(@RequestBody Map<String, Object> payload) {
        double salary = ((Number) payload.getOrDefault("salary", 75000)).doubleValue();
        int yearsAtCompany = ((Number) payload.getOrDefault("yearsAtCompany", 3)).intValue();
        double rating = ((Number) payload.getOrDefault("performanceRating", 3.5)).doubleValue();
        int age = ((Number) payload.getOrDefault("age", 30)).intValue();
        String department = (String) payload.getOrDefault("department", "Engineering");
        boolean overtime = Boolean.TRUE.equals(payload.get("overtime"));
        int workLifeBalance = ((Number) payload.getOrDefault("workLifeBalance", 3)).intValue();
        int promotionGap = ((Number) payload.getOrDefault("promotionGap", 2)).intValue();

        Map<String, Object> result = retentionRiskService.calculateRisk(
                salary, yearsAtCompany, rating, age, department, overtime, workLifeBalance, promotionGap
        );
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @Valid @RequestBody Employee employeeDetails) {
        Employee existing = employeeRepository.findById(id).orElse(null);
        User currentUser = getCurrentUser();
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (currentUser == null || currentUser.getOrganization() == null || existing.getOrganization() == null
                || !existing.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized to update this employee"));
        }
        existing.setName(employeeDetails.getName());
        existing.setAge(employeeDetails.getAge());
        existing.setSalary(employeeDetails.getSalary());
        existing.setYearsAtCompany(employeeDetails.getYearsAtCompany());
        existing.setPerformanceRating(employeeDetails.getPerformanceRating());
        existing.setDepartment(employeeDetails.getDepartment());
        existing.setOrganization(currentUser.getOrganization());
        applyRisk(existing);
        return ResponseEntity.ok(employeeRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        Employee existing = employeeRepository.findById(id).orElse(null);
        User currentUser = getCurrentUser();
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (currentUser == null || currentUser.getOrganization() == null || existing.getOrganization() == null
                || !existing.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized to delete this employee"));
        }
        employeeRepository.delete(existing);
        return ResponseEntity.ok(Map.of("message", "Employee deleted"));
    }

    @PostMapping("/upload-csv")
    public ResponseEntity<?> uploadCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty() || !file.getOriginalFilename().endsWith(".csv")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please upload a valid CSV file"));
        }

        try (CSVParser parser = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .build()
                .parse(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            List<Employee> employees = new ArrayList<>();
            for (CSVRecord record : parser) {
                Employee employee = new Employee();
                employee.setName(record.get("name"));
                employee.setAge(Integer.parseInt(record.get("age")));
                employee.setSalary(new BigDecimal(record.get("salary")));
                employee.setYearsAtCompany(Integer.parseInt(record.get("yearsAtCompany")));
                employee.setPerformanceRating(Double.parseDouble(record.get("performanceRating")));
                employee.setDepartment(record.get("department"));
                employee.setOrganization(getCurrentUser().getOrganization());
                applyRisk(employee);
                employees.add(employee);
            }
            employeeRepository.saveAll(employees);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Imported " + employees.size() + " employees"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "CSV import failed: " + e.getMessage()));
        }
    }

    private void applyRisk(Employee employee) {
        Map<String, Object> prediction = retentionRiskService.predictRetentionRisk(employee);
        employee.setRiskScore(((Number) prediction.get("retentionRiskScore")).doubleValue());
        employee.setRiskLevel((String) prediction.get("riskLevel"));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElse(null);
    }
}
