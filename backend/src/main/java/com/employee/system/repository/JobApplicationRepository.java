package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.employee.system.entity.JobApplication;
import com.employee.system.entity.JobPosting;
import com.employee.system.entity.User;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJobPostingOrderByAppliedAtDesc(JobPosting jobPosting);
    List<JobApplication> findByApplicantOrderByAppliedAtDesc(User applicant);
    boolean existsByJobPostingAndApplicant(JobPosting jobPosting, User applicant);
}
