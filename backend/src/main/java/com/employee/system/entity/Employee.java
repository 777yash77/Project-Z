package com.employee.system.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Min(18)
    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(nullable = false)
    private Integer yearsAtCompany;

    @Column(nullable = false)
    private Double performanceRating;

    @Column(nullable = false)
    private String department;

    private String designation = "Software Engineer";

    private String employeeCode;
    private Integer dailyRate = 800;
    private Integer distanceFromHome = 10;
    private Integer education = 3;
    private String educationField = "Life Sciences";
    private Integer environmentSatisfaction = 3;
    private String gender = "Male";
    private Integer hourlyRate = 65;
    private Integer jobInvolvement = 3;
    private Integer jobLevel = 2;
    private Integer jobSatisfaction = 3;
    private String maritalStatus = "Married";
    private Integer monthlyRate = 15000;
    private Integer numCompaniesWorked = 2;
    private Boolean overTime = false;
    private Integer percentSalaryHike = 14;
    private Integer relationshipSatisfaction = 3;
    private Integer stockOptionLevel = 1;
    private Integer totalWorkingYears = 7;
    private Integer trainingTimesLastYear = 2;
    private Integer workLifeBalance = 3;
    private Integer yearsInCurrentRole = 2;
    private Integer yearsSinceLastPromotion = 1;
    private Integer yearsWithCurrManager = 2;
    private String businessTravel = "Travel_Rarely";

    public Integer getDailyRate() { return dailyRate; }
    public void setDailyRate(Integer dailyRate) { this.dailyRate = dailyRate; }
    public Integer getDistanceFromHome() { return distanceFromHome; }
    public void setDistanceFromHome(Integer distanceFromHome) { this.distanceFromHome = distanceFromHome; }
    public Integer getEducation() { return education; }
    public void setEducation(Integer education) { this.education = education; }
    public String getEducationField() { return educationField; }
    public void setEducationField(String educationField) { this.educationField = educationField; }
    public Integer getEnvironmentSatisfaction() { return environmentSatisfaction; }
    public void setEnvironmentSatisfaction(Integer environmentSatisfaction) { this.environmentSatisfaction = environmentSatisfaction; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public Integer getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Integer hourlyRate) { this.hourlyRate = hourlyRate; }
    public Integer getJobInvolvement() { return jobInvolvement; }
    public void setJobInvolvement(Integer jobInvolvement) { this.jobInvolvement = jobInvolvement; }
    public Integer getJobLevel() { return jobLevel; }
    public void setJobLevel(Integer jobLevel) { this.jobLevel = jobLevel; }
    public Integer getJobSatisfaction() { return jobSatisfaction; }
    public void setJobSatisfaction(Integer jobSatisfaction) { this.jobSatisfaction = jobSatisfaction; }
    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }
    public Integer getMonthlyRate() { return monthlyRate; }
    public void setMonthlyRate(Integer monthlyRate) { this.monthlyRate = monthlyRate; }
    public Integer getNumCompaniesWorked() { return numCompaniesWorked; }
    public void setNumCompaniesWorked(Integer numCompaniesWorked) { this.numCompaniesWorked = numCompaniesWorked; }
    public Boolean getOverTime() { return overTime; }
    public void setOverTime(Boolean overTime) { this.overTime = overTime; }
    public Integer getPercentSalaryHike() { return percentSalaryHike; }
    public void setPercentSalaryHike(Integer percentSalaryHike) { this.percentSalaryHike = percentSalaryHike; }
    public Integer getRelationshipSatisfaction() { return relationshipSatisfaction; }
    public void setRelationshipSatisfaction(Integer relationshipSatisfaction) { this.relationshipSatisfaction = relationshipSatisfaction; }
    public Integer getStockOptionLevel() { return stockOptionLevel; }
    public void setStockOptionLevel(Integer stockOptionLevel) { this.stockOptionLevel = stockOptionLevel; }
    public Integer getTotalWorkingYears() { return totalWorkingYears; }
    public void setTotalWorkingYears(Integer totalWorkingYears) { this.totalWorkingYears = totalWorkingYears; }
    public Integer getTrainingTimesLastYear() { return trainingTimesLastYear; }
    public void setTrainingTimesLastYear(Integer trainingTimesLastYear) { this.trainingTimesLastYear = trainingTimesLastYear; }
    public Integer getWorkLifeBalance() { return workLifeBalance; }
    public void setWorkLifeBalance(Integer workLifeBalance) { this.workLifeBalance = workLifeBalance; }
    public Integer getYearsInCurrentRole() { return yearsInCurrentRole; }
    public void setYearsInCurrentRole(Integer yearsInCurrentRole) { this.yearsInCurrentRole = yearsInCurrentRole; }
    public Integer getYearsSinceLastPromotion() { return yearsSinceLastPromotion; }
    public void setYearsSinceLastPromotion(Integer yearsSinceLastPromotion) { this.yearsSinceLastPromotion = yearsSinceLastPromotion; }
    public Integer getYearsWithCurrManager() { return yearsWithCurrManager; }
    public void setYearsWithCurrManager(Integer yearsWithCurrManager) { this.yearsWithCurrManager = yearsWithCurrManager; }
    public String getBusinessTravel() { return businessTravel; }
    public void setBusinessTravel(String businessTravel) { this.businessTravel = businessTravel; }


    @Column(nullable = false)
    private boolean locked = true; // Employee Organisation Lock

    @Column(nullable = false)
    private String employmentStatus = "ACTIVE"; // ACTIVE, ON_LEAVE, TRANSFERRED, EXITED

    private LocalDate dateOfJoining = LocalDate.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Organization organization;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User createdBy;

    @Column(nullable = false)
    private Double riskScore = 0.0;

    @Column(nullable = false)
    private String riskLevel = "Low";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @jakarta.persistence.OneToMany(mappedBy = "employee", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<TradeListing> tradeListings = new java.util.ArrayList<>();

    @jakarta.persistence.OneToMany(mappedBy = "employee", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<TransferRequest> transferRequests = new java.util.ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
    public Integer getYearsAtCompany() { return yearsAtCompany; }
    public void setYearsAtCompany(Integer yearsAtCompany) { this.yearsAtCompany = yearsAtCompany; }
    public Double getPerformanceRating() { return performanceRating; }
    public void setPerformanceRating(Double performanceRating) { this.performanceRating = performanceRating; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }
    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }
    public LocalDate getDateOfJoining() { return dateOfJoining; }
    public void setDateOfJoining(LocalDate dateOfJoining) { this.dateOfJoining = dateOfJoining; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
