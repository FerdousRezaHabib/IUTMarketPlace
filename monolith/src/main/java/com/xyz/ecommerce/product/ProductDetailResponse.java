package com.xyz.ecommerce.product;

import java.math.BigDecimal;
import java.util.List;

public record ProductDetailResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String category,
        String imageUrl,
        Integer stockQuantity,
        List<ReviewSummary> reviews,
        Double averageRating
) {
}
