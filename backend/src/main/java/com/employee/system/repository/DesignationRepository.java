package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.Designation;
import com.employee.system.entity.Organization;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    List<Designation> findByOrganization(Organization organization);
}
