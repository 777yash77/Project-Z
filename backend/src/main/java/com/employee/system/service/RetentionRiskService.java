package com.employee.system.service;

import com.employee.system.entity.Employee;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RetentionRiskService {

    private final GeminiService geminiService;

    public RetentionRiskService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    public Map<String, Object> predictRetentionRisk(Employee employee) {
        return predictRetentionRisk(employee, new HashMap<>());
    }

    public Map<String, Object> predictRetentionRisk(Employee employee, Map<String, Object> extraParams) {
        Map<String, Object> response;
        try {
            // Prepare payload for ML service
            Map<String, Object> payload = new HashMap<>();
            payload.put("Age", employee.getAge());
            payload.put("MonthlyIncome", employee.getSalary() != null ? employee.getSalary().doubleValue() : 5000);
            payload.put("YearsAtCompany", employee.getYearsAtCompany());
            payload.put("PerformanceRating", employee.getPerformanceRating());
            payload.put("Department", employee.getDepartment());
            
            payload.put("DailyRate", employee.getDailyRate());
            payload.put("DistanceFromHome", employee.getDistanceFromHome());
            payload.put("Education", employee.getEducation());
            payload.put("EducationField", employee.getEducationField());
            payload.put("EnvironmentSatisfaction", employee.getEnvironmentSatisfaction());
            payload.put("Gender", employee.getGender());
            payload.put("HourlyRate", employee.getHourlyRate());
            payload.put("JobInvolvement", employee.getJobInvolvement());
            payload.put("JobLevel", employee.getJobLevel());
            payload.put("JobSatisfaction", employee.getJobSatisfaction());
            payload.put("MaritalStatus", employee.getMaritalStatus());
            payload.put("MonthlyRate", employee.getMonthlyRate());
            payload.put("NumCompaniesWorked", employee.getNumCompaniesWorked());
            payload.put("OverTime", employee.getOverTime());
            payload.put("PercentSalaryHike", employee.getPercentSalaryHike());
            payload.put("RelationshipSatisfaction", employee.getRelationshipSatisfaction());
            payload.put("StockOptionLevel", employee.getStockOptionLevel());
            payload.put("TotalWorkingYears", employee.getTotalWorkingYears());
            payload.put("TrainingTimesLastYear", employee.getTrainingTimesLastYear());
            payload.put("WorkLifeBalance", employee.getWorkLifeBalance());
            payload.put("YearsInCurrentRole", employee.getYearsInCurrentRole());
            payload.put("YearsSinceLastPromotion", employee.getYearsSinceLastPromotion());
            payload.put("YearsWithCurrManager", employee.getYearsWithCurrManager());
            payload.put("BusinessTravel", employee.getBusinessTravel());
            payload.put("JobRole", employee.getDesignation());
            
            // Add simulator parameters if present (overrides employee defaults if run in simulation)
            if (extraParams.containsKey("overtime")) payload.put("OverTime", extraParams.get("overtime"));
            if (extraParams.containsKey("workLifeBalance")) payload.put("WorkLifeBalance", extraParams.get("workLifeBalance"));
            if (extraParams.containsKey("promotionGap")) payload.put("YearsSinceLastPromotion", extraParams.get("promotionGap"));
            if (extraParams.containsKey("jobSatisfaction")) payload.put("JobSatisfaction", extraParams.get("jobSatisfaction"));
            if (extraParams.containsKey("environmentSatisfaction")) payload.put("EnvironmentSatisfaction", extraParams.get("environmentSatisfaction"));
            if (extraParams.containsKey("relationshipSatisfaction")) payload.put("RelationshipSatisfaction", extraParams.get("relationshipSatisfaction"));
            if (extraParams.containsKey("jobInvolvement")) payload.put("JobInvolvement", extraParams.get("jobInvolvement"));
            if (extraParams.containsKey("distanceFromHome")) payload.put("DistanceFromHome", extraParams.get("distanceFromHome"));
            if (extraParams.containsKey("percentSalaryHike")) payload.put("PercentSalaryHike", extraParams.get("percentSalaryHike"));

            // Call ML service
            String mlServiceUrl = System.getenv().getOrDefault("ML_SERVICE_URL", "http://localhost:5000/predict");
            Map<String, Object> mlResponse = restTemplate.postForObject(mlServiceUrl, payload, Map.class);

            if (mlResponse != null && mlResponse.containsKey("riskScore")) {
                double riskScore = ((Number) mlResponse.get("riskScore")).doubleValue();
                String riskLevel = (String) mlResponse.get("riskLevel");

                response = new HashMap<>();
                response.put("retentionRiskScore", riskScore);
                response.put("attritionProbability", riskScore);
                response.put("riskLevel", riskLevel);

                String timeline = riskScore >= 0.75 ? "1–3 Months"
                        : riskScore >= 0.50 ? "3–6 Months" : riskScore >= 0.30 ? "6–12 Months" : "> 1 Year";
                response.put("timeline", timeline);
                response.put("priorityScore", (int) Math.round(riskScore * 100));

                // Add dummy shap factors for UI compatibility
                List<Map<String, Object>> shapFactors = new ArrayList<>();
                shapFactors.add(Map.of("factor", "ML Model Prediction", "impact", "N/A", "direction",
                        riskScore > 0.5 ? "increase" : "decrease"));
                response.put("shapFactors", shapFactors);

                Map<String, Object> geminiCopilot = new HashMap<>();
                geminiCopilot.put("executiveSummary",
                        getExecutiveSummary(riskLevel, employee.getDepartment(), shapFactors));
                geminiCopilot.put("rootCauseAnalysis", getRootCauseAnalysis(shapFactors));
                geminiCopilot.put("immediateHrActions", getImmediateActions(riskLevel, shapFactors));
                geminiCopilot.put("longTermPlan",
                        getLongTermPlan(1, employee.getSalary() != null ? employee.getSalary().doubleValue() : 70000));
                geminiCopilot.put("businessImpact", "Estimated replacement cost: $"
                        + (int) ((employee.getSalary() != null ? employee.getSalary().doubleValue() : 70000) * 0.45)
                        + " + project delay risk.");
                response.put("geminiCopilot", geminiCopilot);
            } else {
                throw new RuntimeException("Invalid ML service response");
            }
        } catch (Exception e) {
            System.err.println("Failed to call ML service, falling back to heuristic: " + e.getMessage());
            // Fallback to heuristic
            response = calculateRisk(
                    employee.getSalary() != null ? employee.getSalary().doubleValue() : 70000.0,
                    employee.getYearsAtCompany(),
                    employee.getPerformanceRating(),
                    employee.getAge(),
                    employee.getDepartment(),
                    extraParams.containsKey("overtime") ? (Boolean) extraParams.get("overtime") : false, 
                    extraParams.containsKey("workLifeBalance") ? (Integer) extraParams.get("workLifeBalance") : 3, 
                    extraParams.containsKey("promotionGap") ? (Integer) extraParams.get("promotionGap") : (employee.getYearsAtCompany() > 3 ? 3 : 1),
                    extraParams.containsKey("jobSatisfaction") ? (Integer) extraParams.get("jobSatisfaction") : employee.getJobSatisfaction() != null ? employee.getJobSatisfaction() : 3,
                    extraParams.containsKey("environmentSatisfaction") ? (Integer) extraParams.get("environmentSatisfaction") : employee.getEnvironmentSatisfaction() != null ? employee.getEnvironmentSatisfaction() : 3,
                    extraParams.containsKey("relationshipSatisfaction") ? (Integer) extraParams.get("relationshipSatisfaction") : employee.getRelationshipSatisfaction() != null ? employee.getRelationshipSatisfaction() : 3,
                    extraParams.containsKey("jobInvolvement") ? (Integer) extraParams.get("jobInvolvement") : employee.getJobInvolvement() != null ? employee.getJobInvolvement() : 3,
                    extraParams.containsKey("distanceFromHome") ? (Integer) extraParams.get("distanceFromHome") : employee.getDistanceFromHome() != null ? employee.getDistanceFromHome() : 10,
                    extraParams.containsKey("percentSalaryHike") ? (Integer) extraParams.get("percentSalaryHike") : employee.getPercentSalaryHike() != null ? employee.getPercentSalaryHike() : 14
            );
        }

        if (employee != null && geminiService != null) {
            String aiReport = geminiService.generateIndividualEmployeeAnalysis(employee, response);
            response.put("fullAiReport", aiReport);
        }

        return response;
    }

    public Map<String, Object> calculateRisk(double salary, int yearsAtCompany, double rating, int age,
            String department, boolean overtime, int workLifeBalance, int promotionGap,
            int jobSatisfaction, int environmentSatisfaction, int relationshipSatisfaction,
            int jobInvolvement, int distanceFromHome, int percentSalaryHike) {
        double score = 0.15;
        List<Map<String, Object>> shapFactors = new ArrayList<>();

        if (rating < 3.0) {
            score += 0.22;
            shapFactors.add(Map.of("factor", "Low Performance Rating", "impact", "+22%", "direction", "increase"));
        }
        if (overtime) {
            score += 0.18;
            shapFactors.add(Map.of("factor", "Excessive Overtime Work", "impact", "+18%", "direction", "increase"));
        }
        if (promotionGap >= 3) {
            score += 0.16;
            shapFactors.add(Map.of("factor", "Promotion Delay (" + promotionGap + " yrs)", "impact", "+16%",
                    "direction", "increase"));
        }
        if (salary < 80000) {
            score += 0.14;
            shapFactors.add(Map.of("factor", "Below Benchmark Salary", "impact", "+14%", "direction", "increase"));
        }
        if (workLifeBalance <= 2) {
            score += 0.12;
            shapFactors.add(Map.of("factor", "Poor Work-Life Balance (" + workLifeBalance + "/5)", "impact", "+12%",
                    "direction", "increase"));
        }
        if (jobSatisfaction <= 2) {
            score += 0.10;
            shapFactors.add(Map.of("factor", "Low Job Satisfaction", "impact", "+10%", "direction", "increase"));
        }
        if (environmentSatisfaction <= 2) {
            score += 0.08;
            shapFactors.add(Map.of("factor", "Low Environment Satisfaction", "impact", "+8%", "direction", "increase"));
        }
        if (distanceFromHome > 20) {
            score += 0.05;
            shapFactors.add(Map.of("factor", "Long Commute Distance", "impact", "+5%", "direction", "increase"));
        }
        if (percentSalaryHike < 13) {
            score += 0.05;
            shapFactors.add(Map.of("factor", "Low Salary Hike", "impact", "+5%", "direction", "increase"));
        }
        if (yearsAtCompany > 5 && promotionGap >= 2) {
            score += 0.10;
            shapFactors
                    .add(Map.of("factor", "High Tenure without Mobility", "impact", "+10%", "direction", "increase"));
        }
        if (department != null && department.equalsIgnoreCase("Sales")) {
            score += 0.08;
            shapFactors
                    .add(Map.of("factor", "High-Stress Department (Sales)", "impact", "+8%", "direction", "increase"));
        }

        // Positive buffers
        if (rating >= 4.5) {
            score -= 0.12;
            shapFactors.add(Map.of("factor", "Top Performer Distinction", "impact", "-12%", "direction", "decrease"));
        }
        if (workLifeBalance >= 4) {
            score -= 0.08;
            shapFactors
                    .add(Map.of("factor", "Strong Work-Life Satisfaction", "impact", "-8%", "direction", "decrease"));
        }
        if (jobSatisfaction >= 4) {
            score -= 0.06;
            shapFactors.add(Map.of("factor", "High Job Satisfaction", "impact", "-6%", "direction", "decrease"));
        }
        if (environmentSatisfaction >= 4) {
            score -= 0.06;
            shapFactors.add(Map.of("factor", "High Environment Satisfaction", "impact", "-6%", "direction", "decrease"));
        }

        score = Math.min(0.96, Math.max(0.04, score));
        double roundedScore = Math.round(score * 100.0) / 100.0;

        String level = roundedScore >= 0.70 ? "High" : roundedScore >= 0.40 ? "Medium" : "Low";
        String timeline = roundedScore >= 0.75 ? "1–3 Months"
                : roundedScore >= 0.50 ? "3–6 Months" : roundedScore >= 0.30 ? "6–12 Months" : "> 1 Year";
        int priorityScore = (int) Math.round(roundedScore * 100);

        Map<String, Object> geminiCopilot = new HashMap<>();
        geminiCopilot.put("executiveSummary", getExecutiveSummary(level, department, shapFactors));
        geminiCopilot.put("rootCauseAnalysis", getRootCauseAnalysis(shapFactors));
        geminiCopilot.put("immediateHrActions", getImmediateActions(level, shapFactors));
        geminiCopilot.put("longTermPlan", getLongTermPlan(promotionGap, salary));
        geminiCopilot.put("businessImpact",
                "Estimated replacement cost: $" + (int) (salary * 0.45) + " + project delay risk.");

        Map<String, Object> response = new HashMap<>();
        response.put("retentionRiskScore", roundedScore);
        response.put("attritionProbability", roundedScore);
        response.put("riskLevel", level);
        response.put("timeline", timeline);
        response.put("priorityScore", priorityScore);
        response.put("shapFactors", shapFactors);
        response.put("geminiCopilot", geminiCopilot);

        return response;
    }

    private String getExecutiveSummary(String level, String department, List<Map<String, Object>> factors) {
        String primaryFactor = factors.isEmpty() ? "general market movement" : (String) factors.get(0).get("factor");
        return String.format("%s attrition risk detected in %s department. Primary contributing driver: %s.",
                level, department != null ? department : "organization", primaryFactor);
    }

    private String getRootCauseAnalysis(List<Map<String, Object>> factors) {
        if (factors.isEmpty())
            return "Employee shows stable retention indicators with balanced tenure and performance metrics.";
        StringBuilder sb = new StringBuilder("Key flight risk drivers identified: ");
        for (int i = 0; i < Math.min(3, factors.size()); i++) {
            if (i > 0)
                sb.append(", ");
            sb.append(factors.get(i).get("factor"));
        }
        return sb.toString() + ".";
    }

    private List<String> getImmediateActions(String level, List<Map<String, Object>> factors) {
        List<String> actions = new ArrayList<>();
        actions.add("Schedule 1-on-1 stay interview within 5 business days.");
        if (level.equalsIgnoreCase("High")) {
            actions.add("Conduct compensation & title alignment audit.");
            actions.add("Review workload distribution and eliminate forced overtime.");
        } else {
            actions.add("Discuss career milestone progression map for next 12 months.");
        }
        return actions;
    }

    private String getLongTermPlan(int promotionGap, double salary) {
        return String.format(
                "Establish clear quarterly promotion milestones. Target 12-month salary adjustment toward market baseline ($%.0f).",
                salary * 1.12);
    }
}
