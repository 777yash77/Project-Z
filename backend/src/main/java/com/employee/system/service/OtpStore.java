package com.employee.system.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe in-memory OTP store.
 * OTPs expire after 5 minutes and are single-use.
 */
@Component
public class OtpStore {

    private static final long OTP_TTL_MS = 5 * 60 * 1000L; // 5 minutes
    private static final SecureRandom RANDOM = new SecureRandom();

    private record OtpEntry(String code, String purpose, Instant expiresAt) {}

    private final ConcurrentHashMap<String, OtpEntry> store = new ConcurrentHashMap<>();

    /** Generate a 6-digit OTP, store it, and return the code. */
    public String generate(String email, String purpose) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        store.put(email.toLowerCase(), new OtpEntry(code, purpose, Instant.now().plusMillis(OTP_TTL_MS)));
        return code;
    }

    /**
     * Verify and consume the OTP.
     * @return true if the code is correct, the purpose matches, and it has not expired.
     */
    public boolean verify(String email, String code, String purpose) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null) return false;
        if (!entry.purpose().equalsIgnoreCase(purpose)) return false;
        if (Instant.now().isAfter(entry.expiresAt())) {
            store.remove(email.toLowerCase());
            return false;
        }
        if (!entry.code().equals(code)) return false;
        store.remove(email.toLowerCase()); // single-use
        return true;
    }

    /** Remove any stored OTP for the given email. */
    public void clear(String email) {
        store.remove(email.toLowerCase());
    }
}
