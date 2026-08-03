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
                northwind.setLocation("Chicago, IL");
                organizationRepository.save(northwind);

                Organization contoso = new Organization();
                contoso.setName("Contoso Talent");
                contoso.setIndustry("Technology");
                contoso.setLocation("Seattle, WA");
                organizationRepository.save(contoso);

                Organization gveng = new Organization();
                gveng.setName("GvenG Enterprise");
                gveng.setIndustry("Global Consulting");
                gveng.setLocation("New York, NY");
                organizationRepository.save(gveng);

                Organization vertex = new Organization();
                vertex.setName("Vertex HR Solutions");
                vertex.setIndustry("Financial Services");
                vertex.setLocation("London, UK");
                organizationRepository.save(vertex);
            }

            if (userRepository.count() == 0) {
                Organization northwind = organizationRepository.findByName("Northwind HR").orElseThrow();
                Organization contoso = organizationRepository.findByName("Contoso Talent").orElseThrow();
                Organization gveng = organizationRepository.findByName("GvenG Enterprise").orElseThrow();
                Organization vertex = organizationRepository.findByName("Vertex HR Solutions").orElseThrow();

                User alex = new User();
                alex.setUsername("alex");
                alex.setEmail("alex@northwind.com");
                alex.setPassword(passwordEncoder.encode("password123"));
                alex.setRole("HR Lead");
                alex.setOrganization(northwind);
                userRepository.save(alex);

                User maya = new User();
                maya.setUsername("maya");
                maya.setEmail("maya@contoso.com");
                maya.setPassword(passwordEncoder.encode("password123"));
                maya.setRole("Senior HR");
                maya.setOrganization(contoso);
                userRepository.save(maya);

                User gvengUser = new User();
                gvengUser.setUsername("GvenG");
                gvengUser.setEmail("gveng@gmail.com");
                gvengUser.setPassword(passwordEncoder.encode("password123"));
                gvengUser.setRole("HR Director");
                gvengUser.setOrganization(gveng);
                userRepository.save(gvengUser);

                User sarah = new User();
                sarah.setUsername("sarah_hr");
                sarah.setEmail("sarah@vertexhr.com");
                sarah.setPassword(passwordEncoder.encode("password123"));
                sarah.setRole("Talent Acquisition");
                sarah.setOrganization(vertex);
                userRepository.save(sarah);
            }

            if (employeeRepository.count() == 0) {
                Organization northwind = organizationRepository.findByName("Northwind HR").orElseThrow();
                Organization contoso = organizationRepository.findByName("Contoso Talent").orElseThrow();
                Organization gveng = organizationRepository.findByName("GvenG Enterprise").orElseThrow();

                List<Employee> employees = List.of(
                    createEmployee("Mina Patel", 34, new BigDecimal("84000"), 6, 4.6, "Operations", northwind, retentionRiskService),
                    createEmployee("Jon Rivera", 41, new BigDecimal("96200"), 9, 3.1, "Sales", northwind, retentionRiskService),
                    createEmployee("Taylor Kim", 29, new BigDecimal("91000"), 2, 4.8, "Engineering", contoso, retentionRiskService),
                    createEmployee("Nina Chen", 38, new BigDecimal("103000"), 7, 3.7, "Design", contoso, retentionRiskService),
                    createEmployee("Marcus Vance", 32, new BigDecimal("115000"), 4, 4.2, "Engineering", gveng, retentionRiskService)
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
