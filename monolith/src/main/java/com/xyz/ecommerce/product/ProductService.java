package com.xyz.ecommerce.product;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewsClient reviewsClient;

    public List<Product> list(String category, String sort) {
        boolean hasCategory = category != null && !category.isBlank();
        boolean sortAsc = "price".equalsIgnoreCase(sort);
        boolean sortDesc = "price_desc".equalsIgnoreCase(sort);

        if (hasCategory && sortAsc) {
            return productRepository.findByCategoryOrderByPriceAsc(category);
        }
        if (hasCategory && sortDesc) {
            return productRepository.findByCategoryOrderByPriceDesc(category);
        }
        if (hasCategory) {
            return productRepository.findByCategory(category);
        }
        if (sortAsc) {
            return productRepository.findAllByOrderByPriceAsc();
        }
        if (sortDesc) {
            return productRepository.findAllByOrderByPriceDesc();
        }
        return productRepository.findAll();
    }

    public Product get(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public ProductDetailResponse getDetail(Long id) {
        Product product = get(id);
        ProductReviewsSummary reviewsSummary = reviewsClient.getReviewsForProduct(id);
        return new ProductDetailResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory(),
                product.getImageUrl(),
                product.getStockQuantity(),
                reviewsSummary.reviews(),
                reviewsSummary.averageRating()
        );
    }

    public Product create(ProductRequest request) {
        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .category(request.category())
                .imageUrl(request.imageUrl())
                .stockQuantity(request.stockQuantity())
                .build();
        return productRepository.save(product);
    }

    public Product update(Long id, ProductRequest request) {
        Product product = get(id);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategory(request.category());
        product.setImageUrl(request.imageUrl());
        product.setStockQuantity(request.stockQuantity());
        return productRepository.save(product);
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }
}
