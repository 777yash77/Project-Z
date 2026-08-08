package com.employee.system.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.system.entity.User;
import com.employee.system.entity.UserDocument;
import com.employee.system.entity.UserEducation;
import com.employee.system.entity.UserExperience;
import com.employee.system.entity.UserSkill;
import com.employee.system.entity.UserAward;
import com.employee.system.entity.UserCertification;
import com.employee.system.repository.UserRepository;
import com.employee.system.service.EmployeeProfileService;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    private final EmployeeProfileService profileService;
    private final UserRepository userRepository;

    public ProfileController(EmployeeProfileService profileService, UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext() == null || SecurityContextHolder.getContext().getAuthentication() == null) return null;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) return null;
        return userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(profileService.getFullProfile(current));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@org.springframework.web.bind.annotation.PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(profileService.getFullProfile(user));
    }

    @PutMapping("/bio")
    public ResponseEntity<?> updateBio(@RequestBody Map<String, String> payload) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User updated = profileService.updateBioAndLinks(current, payload);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/experience")
    public ResponseEntity<?> addExperience(@RequestBody UserExperience exp) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.addExperience(current, exp));
    }

    @PostMapping("/education")
    public ResponseEntity<?> addEducation(@RequestBody UserEducation edu) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.addEducation(current, edu));
    }

    @PostMapping("/skills")
    public ResponseEntity<?> addSkill(@RequestBody Map<String, String> payload) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String skillName = payload.get("skillName");
        if (skillName == null || skillName.isBlank()) return ResponseEntity.badRequest().build();
        UserSkill skill = profileService.addSkill(current, skillName);
        return ResponseEntity.status(HttpStatus.CREATED).body(skill);
    }

    @PostMapping("/documents")
    public ResponseEntity<?> addDocument(@RequestBody Map<String, String> payload) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String docName = payload.get("documentName");
        String docType = payload.get("documentType");
        String fileUrl = payload.get("fileUrl");
        UserDocument doc = profileService.addDocument(current, docName, docType, fileUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @PostMapping("/awards")
    public ResponseEntity<?> addAward(@RequestBody UserAward award) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.addAward(current, award));
    }

    @PostMapping("/certifications")
    public ResponseEntity<?> addCertification(@RequestBody UserCertification cert) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.addCertification(current, cert));
    }
}
