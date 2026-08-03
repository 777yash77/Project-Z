package com.employee.system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDemoData() {
        return args -> {
            // Dummy data seeding completely removed
        };
    }
}
