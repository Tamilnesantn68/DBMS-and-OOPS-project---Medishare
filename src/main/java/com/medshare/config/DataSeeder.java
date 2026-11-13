package com.medshare.config;

import com.medshare.repo.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Seeds the default admin account (admin / admin123) on first run so the platform
 * has an administrator out of the box. Idempotent: only inserts when no admin exists.
 */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    ApplicationRunner seedAdmin(UserRepo users, PasswordEncoder encoder) {
        return args -> {
            if (users.countAdmins() == 0) {
                users.insertAdmin("admin", encoder.encode("admin123"));
                log.info("Seeded default admin account -> username: admin | password: admin123");
            }
        };
    }
}
