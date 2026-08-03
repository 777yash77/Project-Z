package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.Message;
import com.employee.system.entity.User;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderOrRecipientOrderByCreatedAtAsc(User sender, User recipient);
}
