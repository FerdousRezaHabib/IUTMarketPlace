package com.xyz.ecommerce.inventory;

import com.xyz.ecommerce.product.Product;
import com.xyz.ecommerce.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;

    public void decrementStock(Product product, int quantity) {
        if (product.getStockQuantity() < quantity) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Not enough stock for product: " + product.getName());
        }
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
    }
}
