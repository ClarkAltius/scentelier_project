package com.scentelier.backend.service;

import com.scentelier.backend.entity.Carts;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;

    public Carts findByUsers(Users users) {
        return cartRepository.findByUser(users).orElse(null);
    }

    public Carts saveCart(Carts newCart) {
        return cartRepository.save(newCart);
    }
}