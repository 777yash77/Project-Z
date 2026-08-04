package com.employee.system.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.employee.system.entity.Employee;
import com.employee.system.entity.Organization;
import com.employee.system.entity.TradingWindowConfig;
import com.employee.system.entity.TransferRequest;
import com.employee.system.entity.User;
import com.employee.system.repository.EmployeeRepository;
import com.employee.system.repository.TradingWindowConfigRepository;
import com.employee.system.repository.TransferRequestRepository;

@Service
public class TradingRuleEngineService {

    private final TradingWindowConfigRepository configRepository;
    private final TransferRequestRepository transferRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditService auditService;

    public TradingRuleEngineService(TradingWindowConfigRepository configRepository,
                                    TransferRequestRepository transferRequestRepository,
                                    EmployeeRepository employeeRepository,
                                    AuditService auditService) {
        this.configRepository = configRepository;
        this.transferRequestRepository = transferRequestRepository;
        this.employeeRepository = employeeRepository;
        this.auditService = auditService;
    }

    public TradingWindowConfig saveConfig(TradingWindowConfig config) {
        return configRepository.save(config);
    }

    public TradingWindowConfig getActiveConfig(Organization org) {
        return configRepository.findTopByOrganizationAndActiveTrueOrderByIdDesc(org).orElse(null);
    }

    public Map<String, Object> evaluateTransferEligibility(Employee emp, Organization targetOrg) {
        Map<String, Object> result = new HashMap<>();
        List<String> checks = new ArrayList<>();
        boolean eligible = true;

        TradingWindowConfig config = getActiveConfig(emp.getOrganization());
        LocalDate today = LocalDate.now();

        if (config == null || !config.isActive()) {
            checks.add("Transfer window is currently CLOSED for organisation " + emp.getOrganization().getName());
            eligible = false;
        } else {
            if (today.isBefore(config.getStartDate()) || today.isAfter(config.getEndDate())) {
                checks.add("Current date " + today + " is outside the transfer window (" + config.getStartDate() + " to " + config.getEndDate() + ")");
                eligible = false;
            } else {
                checks.add("PASSED: Transfer window is active.");
            }

            if (config.getFreezeStartDate() != null && config.getFreezeEndDate() != null) {
                if (!today.isBefore(config.getFreezeStartDate()) && !today.isAfter(config.getFreezeEndDate())) {
                    checks.add("FAILED: System is currently in TRANSFER FREEZE period (" + config.getFreezeStartDate() + " to " + config.getFreezeEndDate() + ")");
                    eligible = false;
                } else {
                    checks.add("PASSED: Outside transfer freeze window.");
                }
            }

            int tenureMonths = emp.getYearsAtCompany() * 12;
            if (tenureMonths < config.getMinTenureMonths()) {
                checks.add("FAILED: Employee tenure (" + tenureMonths + " months) is less than required (" + config.getMinTenureMonths() + " months)");
                eligible = false;
            } else {
                checks.add("PASSED: Tenure threshold met (" + tenureMonths + " months).");
            }

            if (emp.getPerformanceRating() < config.getMinPerformanceRating()) {
                checks.add("FAILED: Performance rating (" + emp.getPerformanceRating() + ") is below threshold (" + config.getMinPerformanceRating() + ")");
                eligible = false;
            } else {
                checks.add("PASSED: Performance rating threshold met.");
            }
        }

        result.put("eligible", eligible);
        result.put("ruleEvaluations", checks);
        return result;
    }

    public TransferRequest createTransferRequest(Employee emp, Organization targetOrg, String targetDept, String targetDesig, String reason, User requestedBy) {
        Map<String, Object> eval = evaluateTransferEligibility(emp, targetOrg);
        boolean eligible = (Boolean) eval.get("eligible");

        TransferRequest req = new TransferRequest();
        req.setEmployee(emp);
        req.setFromOrganization(emp.getOrganization());
        req.setToOrganization(targetOrg);
        req.setTargetDepartment(targetDept);
        req.setTargetDesignation(targetDesig);
        req.setReason(reason);
        req.setStatus(eligible ? "PENDING_DEPT" : "REJECTED");
        if (!eligible) {
            req.setRejectionReason("Failed Rule Engine Evaluation: " + eval.get("ruleEvaluations"));
        }

        TransferRequest saved = transferRequestRepository.save(req);
        auditService.logAction("TransferRequest", saved.getId(), "CREATE_TRANSFER_REQUEST", null, "Status: " + saved.getStatus(), requestedBy, "Submitted talent transfer request");
        return saved;
    }

    public TransferRequest approveTransferStep(Long requestId, String currentStatus, User approvedBy) {
        TransferRequest req = transferRequestRepository.findById(requestId).orElse(null);
        if (req == null) return null;

        String oldStatus = req.getStatus();
        String nextStatus = oldStatus;

        if ("PENDING_DEPT".equalsIgnoreCase(oldStatus)) nextStatus = "PENDING_HR";
        else if ("PENDING_HR".equalsIgnoreCase(oldStatus)) nextStatus = "PENDING_ORG";
        else if ("PENDING_ORG".equalsIgnoreCase(oldStatus)) {
            nextStatus = "APPROVED";
            req.setApprovedAt(LocalDateTime.now());

            // Process actual transfer: Update employee's organization & department
            Employee emp = req.getEmployee();
            emp.setOrganization(req.getToOrganization());
            if (req.getTargetDepartment() != null && !req.getTargetDepartment().isBlank()) {
                emp.setDepartment(req.getTargetDepartment());
            }
            if (req.getTargetDesignation() != null && !req.getTargetDesignation().isBlank()) {
                emp.setDesignation(req.getTargetDesignation());
            }
            employeeRepository.save(emp);
        }

        req.setStatus(nextStatus);
        TransferRequest saved = transferRequestRepository.save(req);

        auditService.logAction("TransferRequest", saved.getId(), "APPROVE_TRANSFER_STEP", oldStatus, nextStatus, approvedBy, "Approved transfer step");
        return saved;
    }

    public List<TransferRequest> getTransferRequestsForOrg(Organization org) {
        return transferRequestRepository.findByFromOrganization(org);
    }

    public List<TransferRequest> getTransferRequestsForEmployee(Employee emp) {
        return transferRequestRepository.findByEmployee(emp);
    }
}
