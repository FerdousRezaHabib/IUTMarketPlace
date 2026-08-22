package com.xyz.ecommerce.order;

import com.xyz.ecommerce.cart.CartItem;
import com.xyz.ecommerce.cart.CartItemRepository;
import com.xyz.ecommerce.inventory.InventoryService;
import com.xyz.ecommerce.payment.PaymentService;
import com.xyz.ecommerce.product.Product;
import com.xyz.ecommerce.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;

    @Transactional
    public OrderResponse placeOrder(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
            inventoryService.decrementStock(product, cartItem.getQuantity());
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.PENDING)
                .totalAmount(total)
                .build();
        order = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId()).orElseThrow();
            OrderItem orderItem = OrderItem.builder()
                    .orderId(order.getId())
                    .productId(product.getId())
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();
            orderItemRepository.save(orderItem);
        }

        var payment = paymentService.charge(order.getId(), total);
        order.setStatus(payment.getStatus() == com.xyz.ecommerce.payment.PaymentStatus.SUCCESS
                ? OrderStatus.PAID
                : OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        cartItemRepository.deleteByUserId(userId);

        return toResponse(order);
    }

    public List<OrderResponse> getOrdersForUser(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse getOrder(Long id, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");
        }
        return toResponse(order);
    }

    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(status);
        order = orderRepository.save(order);
        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId()).stream()
                .map(i -> new OrderItemResponse(i.getProductId(), i.getQuantity(), i.getPriceAtPurchase()))
                .toList();
        return new OrderResponse(order.getId(), order.getStatus(), order.getTotalAmount(), order.getCreatedAt(), items);
    }
}
