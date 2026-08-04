package com.employee.system.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.employee.system.entity.UserCertification;
import com.employee.system.entity.User;

public interface UserCertificationRepository extends JpaRepository<UserCertification, Long> {
    List<UserCertification> findByUser(User user);
}
