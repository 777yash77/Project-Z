package com.employee.system.controller;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
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

import com.employee.system.service.GeminiService;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RetentionRiskService retentionRiskService;
    private final GeminiService geminiService;

    public EmployeeController(EmployeeRepository employeeRepository, UserRepository userRepository,
                              RetentionRiskService retentionRiskService, GeminiService geminiService) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.retentionRiskService = retentionRiskService;
        this.geminiService = geminiService;
    }

    private void clampPerformanceRating(Employee employee) {
        if (employee.getPerformanceRating() != null) {
            if (employee.getPerformanceRating() > 5.0) employee.setPerformanceRating(5.0);
            if (employee.getPerformanceRating() < 1.0) employee.setPerformanceRating(1.0);
        }
    }

    private void copyEmployeeDetails(Employee target, Employee source) {
        target.setName(source.getName());
        target.setAge(source.getAge());
        target.setSalary(source.getSalary());
        target.setYearsAtCompany(source.getYearsAtCompany());
        target.setPerformanceRating(source.getPerformanceRating());
        target.setDepartment(source.getDepartment());
        target.setDesignation(source.getDesignation());
        target.setDailyRate(source.getDailyRate());
        target.setDistanceFromHome(source.getDistanceFromHome());
        target.setEducation(source.getEducation());
        target.setEducationField(source.getEducationField());
        target.setEnvironmentSatisfaction(source.getEnvironmentSatisfaction());
        target.setGender(source.getGender());
        target.setHourlyRate(source.getHourlyRate());
        target.setJobInvolvement(source.getJobInvolvement());
        target.setJobLevel(source.getJobLevel());
        target.setJobSatisfaction(source.getJobSatisfaction());
        target.setMaritalStatus(source.getMaritalStatus());
        target.setMonthlyRate(source.getMonthlyRate());
        target.setNumCompaniesWorked(source.getNumCompaniesWorked());
        target.setOverTime(source.getOverTime());
        target.setPercentSalaryHike(source.getPercentSalaryHike());
        target.setRelationshipSatisfaction(source.getRelationshipSatisfaction());
        target.setStockOptionLevel(source.getStockOptionLevel());
        target.setTotalWorkingYears(source.getTotalWorkingYears());
        target.setTrainingTimesLastYear(source.getTrainingTimesLastYear());
        target.setWorkLifeBalance(source.getWorkLifeBalance());
        target.setYearsInCurrentRole(source.getYearsInCurrentRole());
        target.setYearsSinceLastPromotion(source.getYearsSinceLastPromotion());
        target.setYearsWithCurrManager(source.getYearsWithCurrManager());
        target.setBusinessTravel(source.getBusinessTravel());
    }

    private Integer parseInteger(String val, Integer defaultVal) {
        if (val == null || val.trim().isEmpty()) return defaultVal;
        try { return (int) Double.parseDouble(val.trim()); } catch (Exception e) { return defaultVal; }
    }
    
    private Boolean parseBoolean(String val, Boolean defaultVal) {
        if (val == null || val.trim().isEmpty()) return defaultVal;
        return Boolean.parseBoolean(val.trim()) || "1".equals(val.trim()) || "yes".equalsIgnoreCase(val.trim());
    }
    
    private String parseString(String val, String defaultVal) {
        if (val == null || val.trim().isEmpty()) return defaultVal;
        return val.trim();
    }

    private Employee findDuplicate(String name, String department, User user) {
        if (user.getOrganization() != null) {
            List<Employee> dups = employeeRepository.findByNameIgnoreCaseAndDepartmentIgnoreCaseAndOrganization(name, department, user.getOrganization());
            if (!dups.isEmpty()) return dups.get(0);
        } else {
            List<Employee> dups = employeeRepository.findByNameIgnoreCaseAndDepartmentIgnoreCaseAndCreatedBy(name, department, user);
            if (!dups.isEmpty()) return dups.get(0);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@Valid @RequestBody Employee employee) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        
        clampPerformanceRating(employee);

        Employee existing = findDuplicate(employee.getName(), employee.getDepartment(), user);
        if (existing != null) {
            copyEmployeeDetails(existing, employee);
            applyRisk(existing);
            Employee saved = employeeRepository.save(existing);
            return ResponseEntity.status(HttpStatus.OK).body(saved);
        }

        employee.setCreatedBy(user);
        if (user.getOrganization() != null) {
            employee.setOrganization(user.getOrganization());
        }
        applyRisk(employee);
        Employee saved = employeeRepository.save(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        User user = getCurrentUser();
        if (user == null) {
            return List.of();
        }
        
        List<Employee> allEmployees = employeeRepository.findAll();
        return allEmployees.stream().filter(emp -> {
            // Exclude current user's own employee record so HR/users do not see themselves in employee directory
            if (emp.getUser() != null && emp.getUser().getId().equals(user.getId())) {
                return false;
            }
            // Own company employees: Fully visible to HR & Org
            if (emp.getOrganization() != null && user.getOrganization() != null && emp.getOrganization().getId().equals(user.getOrganization().getId())) {
                return true;
            }
            if (emp.getCreatedBy() != null && emp.getCreatedBy().getId().equals(user.getId())) {
                return true;
            }
            // Employees from other companies: Visible ONLY when released / exited / transferred / on leave
            String status = emp.getEmploymentStatus();
            return "EXITED".equalsIgnoreCase(status) || "TRANSFERRED".equalsIgnoreCase(status) || "ON_LEAVE".equalsIgnoreCase(status);
        }).sorted(Comparator.comparing(Employee::getRiskScore).reversed()).toList();
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getEmployeeDetails(@PathVariable Long id) {
        Employee existing = employeeRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        User currentUser = getCurrentUser();
        if (currentUser == null || existing.getCreatedBy() == null || !existing.getCreatedBy().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized to access this employee profile"));
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
        
        Employee tempEmp = new Employee();
        tempEmp.setName((String) payload.getOrDefault("name", "Employee"));
        tempEmp.setSalary(BigDecimal.valueOf(salary));
        tempEmp.setYearsAtCompany(yearsAtCompany);
        tempEmp.setPerformanceRating(rating);
        tempEmp.setAge(age);
        tempEmp.setDepartment(department);
        
        Map<String, Object> extraParams = new HashMap<>();
        if (payload.containsKey("overtime")) extraParams.put("overtime", payload.get("overtime"));
        if (payload.containsKey("workLifeBalance")) extraParams.put("workLifeBalance", payload.get("workLifeBalance"));
        if (payload.containsKey("promotionGap")) extraParams.put("promotionGap", payload.get("promotionGap"));

        Map<String, Object> result = retentionRiskService.predictRetentionRisk(tempEmp, extraParams);

        tempEmp.setRiskScore(((Number) result.get("retentionRiskScore")).doubleValue());
        tempEmp.setRiskLevel((String) result.get("riskLevel"));

        if (geminiService != null) {
            String simulatedAiReport = geminiService.generateIndividualEmployeeAnalysis(tempEmp, result);
            result.put("fullAiReport", simulatedAiReport);
        }

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @Valid @RequestBody Employee employeeDetails) {
        Employee existing = employeeRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        User currentUser = getCurrentUser();
        if (currentUser == null || existing.getCreatedBy() == null || !existing.getCreatedBy().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized to update this employee"));
        }

        copyEmployeeDetails(existing, employeeDetails);
        clampPerformanceRating(existing);
        applyRisk(existing);
        return ResponseEntity.ok(employeeRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        Employee existing = employeeRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        
        boolean isCreator = existing.getCreatedBy() != null && existing.getCreatedBy().getId().equals(currentUser.getId());
        boolean isSameOrg = existing.getOrganization() != null && currentUser.getOrganization() != null 
                            && existing.getOrganization().getId().equals(currentUser.getOrganization().getId());

        if (!isCreator && !isSameOrg) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized to delete this employee"));
        }

        employeeRepository.delete(existing);
        return ResponseEntity.ok(Map.of("message", "Employee deleted"));
    }

    @PostMapping("/upload-csv")
    public ResponseEntity<?> uploadCsv(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty() || file.getOriginalFilename() == null || !file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please upload a valid CSV file"));
        }

        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required. Please log in again."));
        }

        try (CSVParser parser = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build()
                .parse(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            List<Employee> employees = new ArrayList<>();
            for (CSVRecord record : parser) {
                String name = record.get("name");
                String dept = record.get("department");
                Employee employee = findDuplicate(name, dept, user);
                
                if (employee == null) {
                    employee = new Employee();
                    employee.setName(name);
                    employee.setDepartment(dept);
                    employee.setCreatedBy(user);
                    if (user.getOrganization() != null) {
                        employee.setOrganization(user.getOrganization());
                    }
                }
                
                employee.setAge(Integer.parseInt(record.get("age")));
                employee.setSalary(new BigDecimal(record.get("salary")));
                employee.setYearsAtCompany(Integer.parseInt(record.get("yearsAtCompany")));
                employee.setPerformanceRating(Double.parseDouble(record.get("performanceRating")));
                
                // Advanced fields
                if (record.isMapped("dailyRate")) employee.setDailyRate(parseInteger(record.get("dailyRate"), employee.getDailyRate()));
                if (record.isMapped("distanceFromHome")) employee.setDistanceFromHome(parseInteger(record.get("distanceFromHome"), employee.getDistanceFromHome()));
                if (record.isMapped("education")) employee.setEducation(parseInteger(record.get("education"), employee.getEducation()));
                if (record.isMapped("educationField")) employee.setEducationField(parseString(record.get("educationField"), employee.getEducationField()));
                if (record.isMapped("environmentSatisfaction")) employee.setEnvironmentSatisfaction(parseInteger(record.get("environmentSatisfaction"), employee.getEnvironmentSatisfaction()));
                if (record.isMapped("gender")) employee.setGender(parseString(record.get("gender"), employee.getGender()));
                if (record.isMapped("hourlyRate")) employee.setHourlyRate(parseInteger(record.get("hourlyRate"), employee.getHourlyRate()));
                if (record.isMapped("jobInvolvement")) employee.setJobInvolvement(parseInteger(record.get("jobInvolvement"), employee.getJobInvolvement()));
                if (record.isMapped("jobLevel")) employee.setJobLevel(parseInteger(record.get("jobLevel"), employee.getJobLevel()));
                if (record.isMapped("jobSatisfaction")) employee.setJobSatisfaction(parseInteger(record.get("jobSatisfaction"), employee.getJobSatisfaction()));
                if (record.isMapped("maritalStatus")) employee.setMaritalStatus(parseString(record.get("maritalStatus"), employee.getMaritalStatus()));
                if (record.isMapped("monthlyRate")) employee.setMonthlyRate(parseInteger(record.get("monthlyRate"), employee.getMonthlyRate()));
                if (record.isMapped("numCompaniesWorked")) employee.setNumCompaniesWorked(parseInteger(record.get("numCompaniesWorked"), employee.getNumCompaniesWorked()));
                if (record.isMapped("overTime")) employee.setOverTime(parseBoolean(record.get("overTime"), employee.getOverTime()));
                if (record.isMapped("percentSalaryHike")) employee.setPercentSalaryHike(parseInteger(record.get("percentSalaryHike"), employee.getPercentSalaryHike()));
                if (record.isMapped("relationshipSatisfaction")) employee.setRelationshipSatisfaction(parseInteger(record.get("relationshipSatisfaction"), employee.getRelationshipSatisfaction()));
                if (record.isMapped("stockOptionLevel")) employee.setStockOptionLevel(parseInteger(record.get("stockOptionLevel"), employee.getStockOptionLevel()));
                if (record.isMapped("totalWorkingYears")) employee.setTotalWorkingYears(parseInteger(record.get("totalWorkingYears"), employee.getTotalWorkingYears()));
                if (record.isMapped("trainingTimesLastYear")) employee.setTrainingTimesLastYear(parseInteger(record.get("trainingTimesLastYear"), employee.getTrainingTimesLastYear()));
                if (record.isMapped("workLifeBalance")) employee.setWorkLifeBalance(parseInteger(record.get("workLifeBalance"), employee.getWorkLifeBalance()));
                if (record.isMapped("yearsInCurrentRole")) employee.setYearsInCurrentRole(parseInteger(record.get("yearsInCurrentRole"), employee.getYearsInCurrentRole()));
                if (record.isMapped("yearsSinceLastPromotion")) employee.setYearsSinceLastPromotion(parseInteger(record.get("yearsSinceLastPromotion"), employee.getYearsSinceLastPromotion()));
                if (record.isMapped("yearsWithCurrManager")) employee.setYearsWithCurrManager(parseInteger(record.get("yearsWithCurrManager"), employee.getYearsWithCurrManager()));
                if (record.isMapped("businessTravel")) employee.setBusinessTravel(parseString(record.get("businessTravel"), employee.getBusinessTravel()));
                
                clampPerformanceRating(employee);
                applyRisk(employee);
                employees.add(employee);
                // Save immediately to catch duplicates within the same CSV
                employeeRepository.save(employee);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Imported/Updated " + employees.size() + " employees successfully."));
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
}