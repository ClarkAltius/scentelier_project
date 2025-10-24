package com.scentelier.backend.service;

import com.scentelier.backend.entity.CartItems;
import com.scentelier.backend.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartItemService {
    private final CartItemRepository cartItemRepository;

    public void saveCartItems(CartItems ci) {
        cartItemRepository.save(ci);
    }

    public void deleteCartItemById(Long cartProductId) {
        cartItemRepository.deleteById(cartProductId);
    }
}

