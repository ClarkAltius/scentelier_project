package com.scentelier.backend.controller;

import com.scentelier.backend.dto.CartItemDto;
import com.scentelier.backend.dto.CartItemResponseDto;
import com.scentelier.backend.entity.CartItems;
import com.scentelier.backend.entity.Carts;
import com.scentelier.backend.entity.Products;
import com.scentelier.backend.entity.Users;
import com.scentelier.backend.service.CartItemService;
import com.scentelier.backend.service.CartService;
import com.scentelier.backend.service.ProductService;
import com.scentelier.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final UserService userService;
    private final ProductService productService;
    private final CartService cartService;
    private final CartItemService cartItemService;

    @PostMapping("/insert")
    public ResponseEntity<String> addToCart(@RequestBody CartItemDto dto){
        Optional<Users> memberOptional = userService.findUserById(dto.getUserId());
        Optional<Products> productOptional = productService.findProductsById(dto.getProductId()) ;

        if(memberOptional.isEmpty() || productOptional.isEmpty()){
            return ResponseEntity.badRequest().body("회원 또는 상품 정보가 올바르지 않습니다.");
        }

        Users users = memberOptional.get();
        Products products = productOptional.get();

        if(products.getStock() < dto.getQuantity()){
            return ResponseEntity.badRequest().body("재고 수량이 부족합니다.");
        }

        Carts cart = cartService.findByUsers(users);

        if(cart == null){
            Carts newCart = new Carts();
            newCart.setUser(users);
            cart = cartService.saveCart(newCart);
        }

        CartItems existingCartItems = null;
        if(cart.getItems() != null) {
            for (CartItems ci : cart.getItems()) {
                if (ci.getProduct().getId().equals(ci.getId())) {
                    existingCartItems = ci;
                    break;
                }
            }
        }

        if (existingCartItems != null) {
            existingCartItems.setQuantity(existingCartItems.getQuantity() + dto.getQuantity());
            cartItemService.saveCartItems(existingCartItems);

        } else {
            CartItems ci = new CartItems();
            ci.setCart(cart);
            ci.setProduct(products);
            ci.setQuantity(dto.getQuantity());
            cartItemService.saveCartItems(ci);
        }

        return ResponseEntity.ok("요청하신 상품이 장바구니에 추가되었습니다.") ;
    }

    @GetMapping("/list/{memberId}")
    public ResponseEntity<List<CartItemResponseDto>> getCartProducts(@PathVariable Long userId) {
        Optional<Users> optionalUsers = userService.findUserById(userId);
        if (optionalUsers.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Users users = optionalUsers.get();
        Carts cart = cartService.findByUsers(users);

        if (cart == null) cart = new Carts();

        List<CartItemResponseDto> cartItems = new ArrayList<>();

        for (CartItems ci : cart.getItems()) {
            cartItems.add(new CartItemResponseDto(ci));
        }

        System.out.println("카트 상품 개수 : " + cartItems.size());

        return ResponseEntity.ok(cartItems); // 전체 카트 상품 반환
    }

}