package com.employee.system.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.employee.system.entity.AuditLog;
import com.employee.system.entity.User;
import com.employee.system.repository.AuditLogRepository;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(String entityName, Long entityId, String action, String oldValue, String newValue, User performedBy, String reason) {
        try {
            AuditLog log = new AuditLog();
            log.setTimestamp(LocalDateTime.now());
            log.setEntityName(entityName);
            log.setEntityId(entityId);
            log.setAction(action);
            log.setOldValue(oldValue);
            log.setNewValue(newValue);
            log.setPerformedBy(performedBy != null ? performedBy.getUsername() : "SYSTEM");
            log.setRole(performedBy != null ? performedBy.getRole() : "SYSTEM");
            log.setReason(reason);
            auditLogRepository.save(log);
        } catch (Exception ignored) {
            // Fail safe logging
        }
    }
}
