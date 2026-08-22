package com.xyz.ecommerce.admin;

import com.xyz.ecommerce.order.OrderResponse;
import com.xyz.ecommerce.order.OrderService;
import com.xyz.ecommerce.product.Product;
import com.xyz.ecommerce.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Thin admin-only wrappers over the product/order endpoints, for the admin
 * dashboard. Access is already restricted to ADMIN by SecurityConfig's
 * /admin/** rule.
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;

    @GetMapping("/products")
    public List<Product> allProducts() {
        return productService.list(null, null);
    }

    @GetMapping("/orders")
    public List<OrderResponse> allOrders() {
        return orderService.getAllOrders();
    }
}
