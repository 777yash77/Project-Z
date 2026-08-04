package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.ConnectionRequest;
import com.employee.system.entity.User;

public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {
    List<ConnectionRequest> findByReceiverAndStatus(User receiver, String status);
    List<ConnectionRequest> findBySenderOrReceiver(User sender, User receiver);
}
