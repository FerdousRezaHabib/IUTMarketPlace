package com.xyz.reviews.review;

import java.util.List;

public record ProductReviewsResponse(
        List<ReviewResponse> reviews,
        Double averageRating
) {
}
