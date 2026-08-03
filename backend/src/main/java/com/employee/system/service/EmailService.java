package com.employee.system.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Sends OTP verification emails via Gmail SMTP.
 * Falls back to console logging if mail is misconfigured (dev mode).
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String toEmail, String otp, String purpose) {
        String subject = purpose.equalsIgnoreCase("REGISTER")
                ? "HR Intelligence — Verify your email"
                : "HR Intelligence — Your login OTP";

        String actionLabel = purpose.equalsIgnoreCase("REGISTER") ? "complete your registration" : "sign in";

        String html = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"/></head>
                <body style="margin:0;padding:0;background:#020805;font-family:Inter,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#020805;padding:40px 0;">
                    <tr><td align="center">
                      <table width="520" cellpadding="0" cellspacing="0"
                             style="background:#060e09;border-radius:20px;border:1px solid rgba(0,255,136,0.12);overflow:hidden;">
                        <!-- Header -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#001a0a,#030e06);padding:32px 40px;text-align:center;">
                            <div style="display:inline-block;background:#00ff88;border-radius:12px;padding:8px 16px;">
                              <span style="font-weight:900;font-size:14px;color:#000;letter-spacing:1px;">HR INTELLIGENCE</span>
                            </div>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding:40px;">
                            <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;">Your verification code</h1>
                            <p style="color:rgba(232,245,238,0.45);font-size:14px;margin:0 0 32px;line-height:1.6;">
                              Use this code to %s. It expires in <strong style="color:#00ff88;">5 minutes</strong>.
                            </p>
                            <!-- OTP box -->
                            <div style="background:#000;border-radius:16px;border:1px solid rgba(0,255,136,0.20);
                                        padding:28px;text-align:center;margin-bottom:32px;">
                              <span style="font-size:48px;font-weight:800;letter-spacing:18px;color:#00ff88;
                                           font-family:monospace;">%s</span>
                            </div>
                            <p style="color:rgba(232,245,238,0.30);font-size:12px;line-height:1.6;margin:0;">
                              If you didn&apos;t request this code, you can safely ignore this email.
                              Do not share this code with anyone.
                            </p>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background:#030e06;padding:20px 40px;border-top:1px solid rgba(0,255,136,0.08);">
                            <p style="color:rgba(232,245,238,0.20);font-size:11px;margin:0;text-align:center;">
                              HR Intelligence &mdash; Employee Retention System
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(actionLabel, otp);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("eaplabsindia@gmail.com", "HR Intelligence");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("OTP email sent to {} for purpose={}", toEmail, purpose);
        } catch (Exception e) {
            // Dev fallback: print OTP to console so dev can proceed without SMTP configured
            log.error("Failed to send OTP email to {}. DEV FALLBACK — OTP is: {}", toEmail, otp, e);
        }
    }
}
