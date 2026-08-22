package com.xyz.ecommerce.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Mock payment: no real gateway, no retries/webhooks. Always succeeds — this
 * is intentionally trivial, per the trimmed project scope.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public Payment charge(Long orderId, BigDecimal amount) {
        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(amount)
                .status(PaymentStatus.SUCCESS)
                .build();
        return paymentRepository.save(payment);
    }
}
