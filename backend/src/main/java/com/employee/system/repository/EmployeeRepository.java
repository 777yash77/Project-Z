package com.employee.system.repository;

import com.employee.system.entity.Employee;
import com.employee.system.entity.Organization;
import com.employee.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findAllByOrderByRiskScoreDesc();
    List<Employee> findByCreatedByOrderByRiskScoreDesc(User createdBy);
    List<Employee> findByOrganizationOrderByRiskScoreDesc(Organization organization);
    List<Employee> findByNameIgnoreCaseAndDepartmentIgnoreCaseAndOrganization(String name, String department, Organization organization);
    List<Employee> findByNameIgnoreCaseAndDepartmentIgnoreCaseAndCreatedBy(String name, String department, User createdBy);
}
