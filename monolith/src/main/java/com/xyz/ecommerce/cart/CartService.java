package com.xyz.ecommerce.cart;

import com.xyz.ecommerce.product.Product;
import com.xyz.ecommerce.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public List<CartItemResponse> getCart(Long userId) {
        return cartItemRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CartItemResponse addItem(Long userId, CartItemRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, request.productId())
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + request.quantity());
                    return existing;
                })
                .orElseGet(() -> CartItem.builder()
                        .userId(userId)
                        .productId(request.productId())
                        .quantity(request.quantity())
                        .build());

        CartItem saved = cartItemRepository.save(cartItem);
        return toResponse(saved, product);
    }

    public void removeItem(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findByIdAndUserId(cartItemId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        cartItemRepository.delete(item);
    }

    private CartItemResponse toResponse(CartItem item) {
        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toResponse(item, product);
    }

    private CartItemResponse toResponse(CartItem item, Product product) {
        return new CartItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                item.getQuantity(),
                product.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity()))
        );
    }
}
