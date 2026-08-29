package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.employee.system.entity.JobPosting;
import com.employee.system.entity.Organization;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByStatusOrderByCreatedAtDesc(String status);
    List<JobPosting> findByOrganizationOrderByCreatedAtDesc(Organization organization);
}
