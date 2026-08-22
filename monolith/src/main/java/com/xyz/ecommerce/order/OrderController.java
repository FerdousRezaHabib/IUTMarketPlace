package com.xyz.ecommerce.order;

import com.xyz.ecommerce.user.Role;
import com.xyz.ecommerce.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public OrderResponse placeOrder(@AuthenticationPrincipal User user) {
        return orderService.placeOrder(user.getId());
    }

    @GetMapping
    public List<OrderResponse> myOrders(@AuthenticationPrincipal User user) {
        return orderService.getOrdersForUser(user.getId());
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return orderService.getOrder(id, user.getId(), user.getRole() == Role.ADMIN);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateStatus(id, request.status());
    }
}
