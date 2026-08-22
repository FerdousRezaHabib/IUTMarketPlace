package com.xyz.reviews.review;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long productId,
        Long userId,
        Integer rating,
        String comment,
        Instant createdAt
) {
}
