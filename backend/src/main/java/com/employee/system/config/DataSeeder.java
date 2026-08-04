package com.employee.system.config;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.employee.system.entity.Employee;
import com.employee.system.entity.Organization;
import com.employee.system.entity.Post;
import com.employee.system.entity.TradingWindowConfig;
import com.employee.system.entity.User;
import com.employee.system.repository.EmployeeRepository;
import com.employee.system.repository.OrganizationRepository;
import com.employee.system.repository.PostRepository;
import com.employee.system.repository.TradingWindowConfigRepository;
import com.employee.system.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final EmployeeRepository employeeRepository;
    private final PostRepository postRepository;
    private final TradingWindowConfigRepository tradingWindowConfigRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      OrganizationRepository organizationRepository,
                      EmployeeRepository employeeRepository,
                      PostRepository postRepository,
                      TradingWindowConfigRepository tradingWindowConfigRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.employeeRepository = employeeRepository;
        this.postRepository = postRepository;
        this.tradingWindowConfigRepository = tradingWindowConfigRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed default superadmin system account if empty database
        if (userRepository.count() == 0) {
            Organization defaultOrg = new Organization();
            defaultOrg.setName("Default Enterprise");
            defaultOrg.setIndustry("Technology");
            defaultOrg.setLocation("Global HQ");
            defaultOrg = organizationRepository.save(defaultOrg);

            User admin = new User();
            admin.setUsername("superadmin");
            admin.setEmail("admin@platform.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("SUPER_ADMIN");
            admin.setOrganization(defaultOrg);
            userRepository.save(admin);
        }
    }
}
