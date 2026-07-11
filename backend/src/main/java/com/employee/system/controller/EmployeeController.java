package com.employee.system.controller;

import com.employee.system.entity.Employee;
import com.employee.system.repository.EmployeeRepository;
import com.employee.system.service.RetentionRiskService;
import jakarta.validation.Valid;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {
    private final EmployeeRepository employeeRepository;
    private final RetentionRiskService retentionRiskService;

    public EmployeeController(EmployeeRepository employeeRepository, RetentionRiskService retentionRiskService) {
        this.employeeRepository = employeeRepository;
        this.retentionRiskService = retentionRiskService;
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        applyRisk(employee);
        Employee saved = employeeRepository.save(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAllByOrderByRiskScoreDesc();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @Valid @RequestBody Employee employeeDetails) {
        Employee existing = employeeRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        existing.setName(employeeDetails.getName());
        existing.setAge(employeeDetails.getAge());
        existing.setSalary(employeeDetails.getSalary());
        existing.setYearsAtCompany(employeeDetails.getYearsAtCompany());
        existing.setPerformanceRating(employeeDetails.getPerformanceRating());
        existing.setDepartment(employeeDetails.getDepartment());
        applyRisk(existing);
        return ResponseEntity.ok(employeeRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        employeeRepository.deleteById(id);
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
}
