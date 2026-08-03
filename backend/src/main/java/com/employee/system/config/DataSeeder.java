package com.employee.system.config;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.employee.system.entity.Employee;
import com.employee.system.entity.Organization;
import com.employee.system.entity.User;
import com.employee.system.repository.EmployeeRepository;
import com.employee.system.repository.OrganizationRepository;
import com.employee.system.repository.UserRepository;
import com.employee.system.service.RetentionRiskService;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDemoData(OrganizationRepository organizationRepository,
                                   UserRepository userRepository,
                                   EmployeeRepository employeeRepository,
                                   PasswordEncoder passwordEncoder,
                                   RetentionRiskService retentionRiskService) {
        return args -> {
            if (organizationRepository.count() == 0) {
                Organization northwind = new Organization();
                northwind.setName("Northwind HR");
                northwind.setIndustry("Manufacturing");
                northwind.setLocation("Chicago");
                organizationRepository.save(northwind);

                Organization contoso = new Organization();
                contoso.setName("Contoso Talent");
                contoso.setIndustry("Technology");
                contoso.setLocation("Seattle");
                organizationRepository.save(contoso);
            }

            if (userRepository.count() == 0) {
                Organization northwind = organizationRepository.findByName("Northwind HR").orElseThrow();
                Organization contoso = organizationRepository.findByName("Contoso Talent").orElseThrow();

                User alex = new User();
                alex.setUsername("alex");
                alex.setEmail("alex@northwind.com");
                alex.setPassword(passwordEncoder.encode("password123"));
                alex.setRole("HR");
                alex.setOrganization(northwind);
                userRepository.save(alex);

                User maya = new User();
                maya.setUsername("maya");
                maya.setEmail("maya@contoso.com");
                maya.setPassword(passwordEncoder.encode("password123"));
                maya.setRole("HR");
                maya.setOrganization(contoso);
                userRepository.save(maya);
            }

            if (employeeRepository.count() == 0) {
                Organization northwind = organizationRepository.findByName("Northwind HR").orElseThrow();
                Organization contoso = organizationRepository.findByName("Contoso Talent").orElseThrow();
                List<Employee> employees = List.of(
                    createEmployee("Mina Patel", 34, new BigDecimal("84000"), 6, 4.6, "Operations", northwind, retentionRiskService),
                    createEmployee("Jon Rivera", 41, new BigDecimal("96200"), 9, 3.1, "Sales", northwind, retentionRiskService),
                    createEmployee("Taylor Kim", 29, new BigDecimal("91000"), 2, 4.8, "Engineering", contoso, retentionRiskService),
                    createEmployee("Nina Chen", 38, new BigDecimal("103000"), 7, 3.7, "Design", contoso, retentionRiskService)
                );
                employeeRepository.saveAll(employees);
            }
        };
    }

    private Employee createEmployee(String name, int age, BigDecimal salary, int yearsAtCompany, double performanceRating,
                                    String department, Organization organization, RetentionRiskService retentionRiskService) {
        Employee employee = new Employee();
        employee.setName(name);
        employee.setAge(age);
        employee.setSalary(salary);
        employee.setYearsAtCompany(yearsAtCompany);
        employee.setPerformanceRating(performanceRating);
        employee.setDepartment(department);
        employee.setOrganization(organization);
        Map<String, Object> prediction = retentionRiskService.predictRetentionRisk(employee);
        employee.setRiskScore(((Number) prediction.get("retentionRiskScore")).doubleValue());
        employee.setRiskLevel((String) prediction.get("riskLevel"));
        return employee;
    }
}
