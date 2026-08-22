package com.xyz.reviews.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReviewRequest(
        @NotNull Long productId,
        @NotNull @Min(1) @Max(5) Integer rating,
        String comment
) {
}
