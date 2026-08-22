package com.xyz.ecommerce.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        Integer quantity,
        BigDecimal priceAtPurchase
) {
}
