package com.xyz.reviews.review;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ReviewResponse addReview(@AuthenticationPrincipal Long userId, @Valid @RequestBody ReviewRequest request) {
        return reviewService.addReview(userId, request);
    }

    @GetMapping("/product/{productId}")
    public ProductReviewsResponse getReviewsForProduct(@PathVariable Long productId) {
        return reviewService.getReviewsForProduct(productId);
    }
}
