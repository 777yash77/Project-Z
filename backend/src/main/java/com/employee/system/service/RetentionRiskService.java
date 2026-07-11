package com.employee.system.service;

import com.employee.system.entity.Employee;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class RetentionRiskService {

    public Map<String, Object> predictRetentionRisk(Employee employee) {
        double score = 0.15;
        if (employee.getYearsAtCompany() > 5) score += 0.15;
        if (employee.getPerformanceRating() < 3.0) score += 0.2;
        if (employee.getSalary().compareTo(new BigDecimal("80000")) < 0) score += 0.1;
        if (employee.getAge() > 45) score += 0.1;
        if (employee.getDepartment().equalsIgnoreCase("Sales")) score += 0.1;

        score = Math.min(0.95, Math.max(0.05, score));
        String level = score >= 0.75 ? "High" : score >= 0.45 ? "Medium" : "Low";

        Map<String, Object> response = new HashMap<>();
        response.put("retentionRiskScore", round(score));
        response.put("riskLevel", level);
        return response;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
