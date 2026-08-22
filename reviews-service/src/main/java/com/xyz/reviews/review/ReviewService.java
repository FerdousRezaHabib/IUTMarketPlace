package com.xyz.reviews.review;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewResponse addReview(Long userId, ReviewRequest request) {
        Review review = Review.builder()
                .productId(request.productId())
                .userId(userId)
                .rating(request.rating())
                .comment(request.comment())
                .build();
        review = reviewRepository.save(review);
        return toResponse(review);
    }

    public ProductReviewsResponse getReviewsForProduct(Long productId) {
        List<ReviewResponse> reviews = reviewRepository.findByProductId(productId).stream()
                .map(this::toResponse)
                .toList();
        Double average = reviewRepository.findAverageRatingByProductId(productId);
        return new ProductReviewsResponse(reviews, average);
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(review.getId(), review.getProductId(), review.getUserId(),
                review.getRating(), review.getComment(), review.getCreatedAt());
    }
}
