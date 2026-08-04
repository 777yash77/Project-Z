package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.User;
import com.employee.system.entity.UserEducation;

public interface UserEducationRepository extends JpaRepository<UserEducation, Long> {
    List<UserEducation> findByUser(User user);
}
