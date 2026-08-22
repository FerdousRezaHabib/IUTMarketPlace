package com.xyz.ecommerce.product;

import java.time.Instant;

public record ReviewSummary(
        Long id,
        Long userId,
        Integer rating,
        String comment,
        Instant createdAt
) {
}
