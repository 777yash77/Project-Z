package com.employee.system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.Organization;
import com.employee.system.entity.TradingWindowConfig;

public interface TradingWindowConfigRepository extends JpaRepository<TradingWindowConfig, Long> {
    List<TradingWindowConfig> findByOrganization(Organization organization);
    Optional<TradingWindowConfig> findTopByOrganizationAndActiveTrueOrderByIdDesc(Organization organization);
}
