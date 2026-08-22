package com.xyz.ecommerce.product;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Calls the standalone Reviews microservice for the product-detail page.
 * This is the one place a network call replaces what would otherwise be a
 * function call, so it must fail gracefully (short timeout + empty fallback)
 * instead of breaking the product page when reviews-service is unavailable.
 */
@Component
public class ReviewsClient {

    private static final Logger log = LoggerFactory.getLogger(ReviewsClient.class);

    private final RestClient restClient;

    public ReviewsClient(@Value("${reviews.service.url}") String reviewsServiceUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        requestFactory.setReadTimeout(Duration.ofSeconds(2));

        this.restClient = RestClient.builder()
                .baseUrl(reviewsServiceUrl)
                .requestFactory(requestFactory)
                .build();
    }

    public ProductReviewsSummary getReviewsForProduct(Long productId) {
        try {
            ProductReviewsSummary result = restClient.get()
                    .uri("/reviews/product/{id}", productId)
                    .retrieve()
                    .body(ProductReviewsSummary.class);
            return result != null ? result : ProductReviewsSummary.empty();
        } catch (Exception e) {
            log.warn("reviews-service unavailable, returning empty reviews for product {}: {}",
                    productId, e.getMessage());
            return ProductReviewsSummary.empty();
        }
    }
}
