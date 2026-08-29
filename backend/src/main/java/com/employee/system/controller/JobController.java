package com.employee.system.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.system.entity.JobApplication;
import com.employee.system.entity.JobPosting;
import com.employee.system.entity.User;
import com.employee.system.repository.JobApplicationRepository;
import com.employee.system.repository.JobPostingRepository;
import com.employee.system.repository.UserRepository;
import com.employee.system.service.EmployeeProfileService;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobPostingRepository jobPostingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileService profileService;

    public JobController(JobPostingRepository jobPostingRepository,
                         JobApplicationRepository jobApplicationRepository,
                         UserRepository userRepository,
                         EmployeeProfileService profileService) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
        this.profileService = profileService;
    }

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext() == null || SecurityContextHolder.getContext().getAuthentication() == null) return null;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) return null;
        return userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);
    }

    // 1. Create Job Posting (HR / ORGANISATION)
    @PostMapping
    public ResponseEntity<?> createJobPosting(@RequestBody JobPosting jobPosting) {
        User current = getCurrentUser();
        if (current == null || "EMPLOYEE".equals(current.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        jobPosting.setCreatedBy(current);
        jobPosting.setOrganization(current.getOrganization());
        JobPosting saved = jobPostingRepository.save(jobPosting);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 2. Get All Open Job Postings (For Employee Job Board)
    @GetMapping
    public ResponseEntity<?> getAllOpenJobs() {
        List<JobPosting> jobs = jobPostingRepository.findByStatusOrderByCreatedAtDesc("OPEN");
        return ResponseEntity.ok(jobs);
    }

    // 3. Get My Organization's Job Postings (For HR)
    @GetMapping("/my")
    public ResponseEntity<?> getMyOrgJobs() {
        User current = getCurrentUser();
        if (current == null || current.getOrganization() == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        List<JobPosting> jobs = jobPostingRepository.findByOrganizationOrderByCreatedAtDesc(current.getOrganization());
        return ResponseEntity.ok(jobs);
    }

    // 4. Apply to a Job
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<?> applyToJob(@PathVariable Long jobId) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        JobPosting job = jobPostingRepository.findById(jobId).orElse(null);
        if (job == null || !"OPEN".equals(job.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Job is not available"));
        }

        if (jobApplicationRepository.existsByJobPostingAndApplicant(job, current)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already applied to this job"));
        }

        JobApplication app = new JobApplication();
        app.setJobPosting(job);
        app.setApplicant(current);
        JobApplication saved = jobApplicationRepository.save(app);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 5. Get Applications for a specific Job Posting
    @GetMapping("/{jobId}/applications")
    public ResponseEntity<?> getJobApplications(@PathVariable Long jobId) {
        JobPosting job = jobPostingRepository.findById(jobId).orElse(null);
        if (job == null) return ResponseEntity.notFound().build();

        User current = getCurrentUser();
        if (current == null || (current.getOrganization() != null && !current.getOrganization().getId().equals(job.getOrganization().getId()))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<JobApplication> apps = jobApplicationRepository.findByJobPostingOrderByAppliedAtDesc(job);
        return ResponseEntity.ok(apps);
    }

    // 6. Get my Applications (For Employee)
    @GetMapping("/applications/my")
    public ResponseEntity<?> getMyApplications() {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<JobApplication> apps = jobApplicationRepository.findByApplicantOrderByAppliedAtDesc(current);
        return ResponseEntity.ok(apps);
    }

    // 7. Scout "Open to Work" Candidates
    @GetMapping("/candidates")
    public ResponseEntity<?> getOpenCandidates() {
        User current = getCurrentUser();
        if (current == null || "EMPLOYEE".equals(current.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<User> openUsers = userRepository.findByOpenForWork(true);
        List<Map<String, Object>> candidates = new ArrayList<>();
        
        for (User u : openUsers) {
            Map<String, Object> candidateData = new HashMap<>();
            candidateData.put("id", u.getId());
            candidateData.put("name", u.getUsername());
            candidateData.put("email", u.getEmail());
            candidateData.put("headline", u.getHeadline());
            candidateData.put("avatarUrl", u.getAvatarUrl());
            candidateData.put("currentOrganization", u.getOrganization() != null ? u.getOrganization().getName() : "Independent");
            
            // Inject Skills
            candidateData.put("skills", profileService.getFullProfile(u).get("skills"));
            
            candidates.add(candidateData);
        }

        return ResponseEntity.ok(candidates);
    }
}
