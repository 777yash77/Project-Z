package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.User;
import com.employee.system.entity.UserSkill;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByUser(User user);
}
