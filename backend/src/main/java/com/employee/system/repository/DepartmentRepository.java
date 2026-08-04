package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.Department;
import com.employee.system.entity.Organization;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByOrganization(Organization organization);
}
