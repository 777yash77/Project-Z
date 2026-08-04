package com.employee.system.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.employee.system.entity.AuditLog;
import com.employee.system.entity.Department;
import com.employee.system.entity.Designation;
import com.employee.system.entity.Organization;
import com.employee.system.entity.User;
import com.employee.system.repository.AuditLogRepository;
import com.employee.system.repository.DepartmentRepository;
import com.employee.system.repository.DesignationRepository;
import com.employee.system.repository.OrganizationRepository;
import com.employee.system.repository.UserRepository;

import com.employee.system.entity.Employee;
import com.employee.system.repository.EmployeeRepository;

@Service
public class OrganizationManagementService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public OrganizationManagementService(UserRepository userRepository,
                                         OrganizationRepository organizationRepository,
                                         DepartmentRepository departmentRepository,
                                         DesignationRepository designationRepository,
                                         AuditLogRepository auditLogRepository,
                                         EmployeeRepository employeeRepository,
                                         PasswordEncoder passwordEncoder,
                                         AuditService auditService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.auditLogRepository = auditLogRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public User createHrUser(Organization org, String username, String email, User performedBy) {
        String tempPassword = "HR-" + UUID.randomUUID().toString().substring(0, 8);
        User hr = new User();
        hr.setUsername(username);
        hr.setEmail(email);
        hr.setPassword(passwordEncoder.encode(tempPassword));
        hr.setRole("HR");
        hr.setOrganization(org);
        hr.setActive(true);
        hr.setApproved(true);
        hr.setSuspended(false);
        User saved = userRepository.save(hr);

        // Auto-link HR user as an Employee record in the HR department of the Organisation
        Employee hrEmp = new Employee();
        hrEmp.setName("HR - " + username);
        hrEmp.setDepartment("Human Resources");
        hrEmp.setDesignation("HR Manager");
        hrEmp.setEmployeeCode("HRC-" + saved.getId());
        hrEmp.setAge(30);
        hrEmp.setSalary(new java.math.BigDecimal("95000.00"));
        hrEmp.setYearsAtCompany(1);
        hrEmp.setPerformanceRating(4.0);
        hrEmp.setOrganization(org);
        hrEmp.setUser(saved);
        hrEmp.setCreatedBy(performedBy);
        hrEmp.setRiskScore(5.0);
        hrEmp.setRiskLevel("Low");
        employeeRepository.save(hrEmp);

        auditService.logAction("User", saved.getId(), "CREATE_HR", null, "Username: " + username + ", Email: " + email, performedBy, "Organisation created HR account and employee record");
        return saved;
    }

    public List<User> getHrUsersForOrg(Organization org) {
        return userRepository.findAll().stream()
                .filter(u -> u.getOrganization() != null && u.getOrganization().getId().equals(org.getId()) && "HR".equalsIgnoreCase(u.getRole()))
                .toList();
    }

    public User toggleHrStatus(Long hrId, String statusType, boolean value, User performedBy) {
        User hr = userRepository.findById(hrId).orElse(null);
        if (hr == null) return null;

        String oldVal = "Active:" + hr.isActive() + ", Suspended:" + hr.isSuspended() + ", Approved:" + hr.isApproved();
        if ("active".equalsIgnoreCase(statusType)) hr.setActive(value);
        if ("suspended".equalsIgnoreCase(statusType)) hr.setSuspended(value);
        if ("approved".equalsIgnoreCase(statusType)) hr.setApproved(value);

        User saved = userRepository.save(hr);
        String newVal = "Active:" + saved.isActive() + ", Suspended:" + saved.isSuspended() + ", Approved:" + saved.isApproved();

        auditService.logAction("User", saved.getId(), "UPDATE_HR_STATUS", oldVal, newVal, performedBy, "Status toggle: " + statusType + "=" + value);
        return saved;
    }

    public String resetHrPassword(Long hrId, User performedBy) {
        User hr = userRepository.findById(hrId).orElse(null);
        if (hr == null) return null;

        String newPassword = "HR-" + UUID.randomUUID().toString().substring(0, 8);
        hr.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(hr);

        auditService.logAction("User", hr.getId(), "RESET_HR_PASSWORD", null, "Password reset successfully", performedBy, "Organisation reset HR password");
        return newPassword;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public Department createDepartment(Organization org, String name, String code, String description) {
        Department dept = new Department();
        dept.setName(name);
        dept.setCode(code);
        dept.setDescription(description);
        dept.setOrganization(org);
        return departmentRepository.save(dept);
    }

    public List<Department> getDepartments(Organization org) {
        return departmentRepository.findByOrganization(org);
    }

    public Designation createDesignation(Organization org, Department dept, String title, String gradeLevel) {
        Designation desig = new Designation();
        desig.setTitle(title);
        desig.setGradeLevel(gradeLevel != null ? gradeLevel : "L1");
        desig.setDepartment(dept);
        desig.setOrganization(org);
        return designationRepository.save(desig);
    }

    public List<Designation> getDesignations(Organization org) {
        return designationRepository.findByOrganization(org);
    }
}
