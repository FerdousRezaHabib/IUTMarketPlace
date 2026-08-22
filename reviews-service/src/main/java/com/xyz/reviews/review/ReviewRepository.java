package com.xyz.reviews.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);

    @Query("select avg(r.rating) from Review r where r.productId = :productId")
    Double findAverageRatingByProductId(Long productId);
}
