package com.xyz.ecommerce.product;

import java.util.List;

public record ProductReviewsSummary(
        List<ReviewSummary> reviews,
        Double averageRating
) {
    public static ProductReviewsSummary empty() {
        return new ProductReviewsSummary(List.of(), null);
    }
}
