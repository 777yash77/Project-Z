package com.employee.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class EmployeeRetentionApplication {
    public static void main(String[] args) {
        SpringApplication.run(EmployeeRetentionApplication.class, args);
    }

    @Bean
    CommandLineRunner alterTables(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE posts MODIFY media_url LONGTEXT;");
                jdbcTemplate.execute("ALTER TABLE users MODIFY avatar_url LONGTEXT;");
                jdbcTemplate.execute("ALTER TABLE users MODIFY cover_url LONGTEXT;");
            } catch (Exception e) {
                // Ignore if tables don't exist yet
                System.out.println("Warning: Could not alter tables to LONGTEXT - " + e.getMessage());
            }
        };
    }
}
