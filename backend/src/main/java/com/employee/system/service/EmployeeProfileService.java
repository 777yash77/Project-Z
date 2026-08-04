package com.employee.system.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.employee.system.entity.Employee;
import com.employee.system.entity.User;
import com.employee.system.entity.UserDocument;
import com.employee.system.entity.UserEducation;
import com.employee.system.entity.UserExperience;
import com.employee.system.entity.UserSkill;
import com.employee.system.repository.EmployeeRepository;
import com.employee.system.repository.UserDocumentRepository;
import com.employee.system.repository.UserEducationRepository;
import com.employee.system.repository.UserExperienceRepository;
import com.employee.system.repository.UserSkillRepository;
import com.employee.system.repository.UserRepository;

@Service
public class EmployeeProfileService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final UserExperienceRepository experienceRepository;
    private final UserEducationRepository educationRepository;
    private final UserSkillRepository skillRepository;
    private final UserDocumentRepository documentRepository;
    private final AuditService auditService;

    public EmployeeProfileService(UserRepository userRepository,
                                  EmployeeRepository employeeRepository,
                                  UserExperienceRepository experienceRepository,
                                  UserEducationRepository educationRepository,
                                  UserSkillRepository skillRepository,
                                  UserDocumentRepository documentRepository,
                                  AuditService auditService) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.experienceRepository = experienceRepository;
        this.educationRepository = educationRepository;
        this.skillRepository = skillRepository;
        this.documentRepository = documentRepository;
        this.auditService = auditService;
    }

    public Map<String, Object> getFullProfile(User user) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("user", user);

        Employee emp = employeeRepository.findAll().stream()
                .filter(e -> e.getUser() != null && e.getUser().getId().equals(user.getId()))
                .findFirst().orElse(null);
        profile.put("employmentDetails", emp);

        profile.put("experiences", experienceRepository.findByUser(user));
        profile.put("educations", educationRepository.findByUser(user));
        profile.put("skills", skillRepository.findByUser(user));
        profile.put("documents", documentRepository.findByUser(user));
        return profile;
    }

    public User updateBioAndLinks(User user, Map<String, String> payload) {
        if (payload.containsKey("headline")) user.setHeadline(payload.get("headline"));
        if (payload.containsKey("bio")) user.setBio(payload.get("bio"));
        if (payload.containsKey("phone")) user.setPhone(payload.get("phone"));
        if (payload.containsKey("location")) user.setLocation(payload.get("location"));
        if (payload.containsKey("website")) user.setWebsite(payload.get("website"));
        if (payload.containsKey("githubUrl")) user.setGithubUrl(payload.get("githubUrl"));
        if (payload.containsKey("linkedinUrl")) user.setLinkedinUrl(payload.get("linkedinUrl"));
        if (payload.containsKey("coverUrl")) user.setCoverUrl(payload.get("coverUrl"));
        if (payload.containsKey("avatarUrl")) user.setAvatarUrl(payload.get("avatarUrl"));
        return userRepository.save(user);
    }

    public UserExperience addExperience(User user, UserExperience exp) {
        exp.setUser(user);
        return experienceRepository.save(exp);
    }

    public UserEducation addEducation(User user, UserEducation edu) {
        edu.setUser(user);
        return educationRepository.save(edu);
    }

    public UserSkill addSkill(User user, String skillName) {
        UserSkill skill = new UserSkill();
        skill.setUser(user);
        skill.setSkillName(skillName);
        skill.setEndorsementCount(1);
        return skillRepository.save(skill);
    }

    public UserDocument addDocument(User user, String docName, String docType, String fileUrl) {
        UserDocument doc = new UserDocument();
        doc.setUser(user);
        doc.setDocumentName(docName);
        doc.setDocumentType(docType != null ? docType : "RESUME");
        doc.setFileUrl(fileUrl);
        return documentRepository.save(doc);
    }
}
