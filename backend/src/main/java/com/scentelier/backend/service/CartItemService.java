package com.scentelier.backend.service;

import com.scentelier.backend.entity.CartItems;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartItemService {
    private final CartItemRepository cartItemRepository;

    public void saveCartItems(CartItems ci) {
        cartItemRepository.save(ci);
    }

    public void deleteCartItemById(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    public void delete(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    public Optional<CartItems> findCartItemById(Long cartItemId) {
        return cartItemRepository.findById(cartItemId);
    }

    public int getCartItemCount(Users user) {
        return cartItemRepository.countByCartUser(user);
    }
}

