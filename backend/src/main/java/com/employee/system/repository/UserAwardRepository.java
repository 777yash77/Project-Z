package com.employee.system.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.employee.system.entity.UserAward;
import com.employee.system.entity.User;

public interface UserAwardRepository extends JpaRepository<UserAward, Long> {
    List<UserAward> findByUser(User user);
}
