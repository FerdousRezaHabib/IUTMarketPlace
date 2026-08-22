package com.xyz.ecommerce.cart;

import com.xyz.ecommerce.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public List<CartItemResponse> getCart(@AuthenticationPrincipal User user) {
        return cartService.getCart(user.getId());
    }

    @PostMapping("/items")
    public CartItemResponse addItem(@AuthenticationPrincipal User user, @Valid @RequestBody CartItemRequest request) {
        return cartService.addItem(user.getId(), request);
    }

    @DeleteMapping("/items/{id}")
    public void removeItem(@AuthenticationPrincipal User user, @PathVariable Long id) {
        cartService.removeItem(user.getId(), id);
    }
}
