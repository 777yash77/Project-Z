package com.employee.system.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe in-memory OTP store.
 * OTPs expire after 15 minutes and allow re-entry on typos.
 */
@Component
public class OtpStore {

    private static final long OTP_TTL_MS = 15 * 60 * 1000L; // 15 minutes
    private static final SecureRandom RANDOM = new SecureRandom();

    private record OtpEntry(String code, String purpose, Instant expiresAt) {}

    private final ConcurrentHashMap<String, OtpEntry> store = new ConcurrentHashMap<>();

    /** Generate a 6-digit OTP, store it, and return the code. */
    public String generate(String email, String purpose) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        store.put(email.trim().toLowerCase(), new OtpEntry(code, purpose, Instant.now().plusMillis(OTP_TTL_MS)));
        return code;
    }

    /**
     * Verify the OTP.
     * Removes the OTP ONLY upon successful verification.
     */
    public boolean verify(String email, String code, String purpose) {
        if (email == null || code == null || purpose == null) return false;
        OtpEntry entry = store.get(email.trim().toLowerCase());
        if (entry == null) return false;
        if (!entry.purpose().equalsIgnoreCase(purpose.trim())) return false;
        if (Instant.now().isAfter(entry.expiresAt())) {
            store.remove(email.trim().toLowerCase());
            return false;
        }
        if (!entry.code().equals(code.trim())) return false;
        store.remove(email.trim().toLowerCase()); // Consume OTP on successful match
        return true;
    }

    /** Clear stored OTP for email */
    public void clear(String email) {
        if (email != null) store.remove(email.trim().toLowerCase());
    }
}
