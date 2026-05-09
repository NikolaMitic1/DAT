package com.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String token) {
        String link = baseUrl + "/api/auth/verify?token=" + token;

        String html = """
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verifikacija email adrese</h2>
                    <p>Hvala na registraciji! Klikni na dugme ispod da verifikuješ svoju email adresu.</p>
                    <a href="%s"
                       style="display:inline-block; padding:12px 24px; background:#1976d2;
                              color:#fff; text-decoration:none; border-radius:4px;">
                        Verifikuj Email
                    </a>
                    <p style="margin-top:16px; color:#666;">Link važi 24 sata.</p>
                </body>
                </html>
                """.formatted(link);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verifikacija email adrese");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Greška pri slanju emaila: " + e.getMessage());
        }
    }
}
