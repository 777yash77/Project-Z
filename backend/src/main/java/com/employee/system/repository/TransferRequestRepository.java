package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.Employee;
import com.employee.system.entity.Organization;
import com.employee.system.entity.TransferRequest;

public interface TransferRequestRepository extends JpaRepository<TransferRequest, Long> {
    List<TransferRequest> findByEmployee(Employee employee);
    List<TransferRequest> findByFromOrganization(Organization organization);
    List<TransferRequest> findByToOrganization(Organization organization);
}
