package com.employee.system.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "trading_window_configs")
public class TradingWindowConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Organization organization;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private LocalDate freezeStartDate;
    private LocalDate freezeEndDate;

    private Integer minTenureMonths = 6;
    private Double minPerformanceRating = 3.0;
    private Integer noticePeriodDays = 30;

    private boolean requireManagerApproval = true;
    private boolean requireDeptApproval = true;
    private boolean requireHrApproval = true;
    private boolean requireOrgApproval = true;

    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalDate getFreezeStartDate() { return freezeStartDate; }
    public void setFreezeStartDate(LocalDate freezeStartDate) { this.freezeStartDate = freezeStartDate; }

    public LocalDate getFreezeEndDate() { return freezeEndDate; }
    public void setFreezeEndDate(LocalDate freezeEndDate) { this.freezeEndDate = freezeEndDate; }

    public Integer getMinTenureMonths() { return minTenureMonths; }
    public void setMinTenureMonths(Integer minTenureMonths) { this.minTenureMonths = minTenureMonths; }

    public Double getMinPerformanceRating() { return minPerformanceRating; }
    public void setMinPerformanceRating(Double minPerformanceRating) { this.minPerformanceRating = minPerformanceRating; }

    public Integer getNoticePeriodDays() { return noticePeriodDays; }
    public void setNoticePeriodDays(Integer noticePeriodDays) { this.noticePeriodDays = noticePeriodDays; }

    public boolean isRequireManagerApproval() { return requireManagerApproval; }
    public void setRequireManagerApproval(boolean requireManagerApproval) { this.requireManagerApproval = requireManagerApproval; }

    public boolean isRequireDeptApproval() { return requireDeptApproval; }
    public void setRequireDeptApproval(boolean requireDeptApproval) { this.requireDeptApproval = requireDeptApproval; }

    public boolean isRequireHrApproval() { return requireHrApproval; }
    public void setRequireHrApproval(boolean requireHrApproval) { this.requireHrApproval = requireHrApproval; }

    public boolean isRequireOrgApproval() { return requireOrgApproval; }
    public void setRequireOrgApproval(boolean requireOrgApproval) { this.requireOrgApproval = requireOrgApproval; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
