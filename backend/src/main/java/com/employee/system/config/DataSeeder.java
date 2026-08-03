package com.employee.system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.employee.system.repository.UserRepository;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDemoData(UserRepository userRepository) {
        return args -> {
            userRepository.findAll().forEach(user -> {
                String name = user.getUsername() != null ? user.getUsername().trim() : "";
                if ("Yaswanth".equalsIgnoreCase(name) || "Yaswant".equalsIgnoreCase(name) || "Yash".equalsIgnoreCase(name)) {
                    try {
                        userRepository.delete(user);
                    } catch (Exception ignored) {}
                }
            });
        };
    }
}
