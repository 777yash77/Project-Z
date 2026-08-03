package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.TradeListing;

public interface TradeListingRepository extends JpaRepository<TradeListing, Long> {
    List<TradeListing> findAllByOrderByCreatedAtDesc();
}
