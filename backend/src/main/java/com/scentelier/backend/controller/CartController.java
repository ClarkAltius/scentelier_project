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
        Optional<Users> UserOptional = userService.findUserById(dto.getUserId());
        Optional<Products> productOptional = productService.findProductsById(dto.getProductId()) ;

        if(UserOptional.isEmpty() || productOptional.isEmpty()){
            return ResponseEntity.badRequest().body("회원 또는 상품 정보가 올바르지 않습니다.");
        }

        Users users = UserOptional.get();
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
                if (ci.getProduct().getId().equals(dto.getProductId())) {
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

    @GetMapping("/list/{userId}")
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

    @PatchMapping("/edit/{cartItemId}")
    public ResponseEntity<String> updateCartItems(@PathVariable Long cartItemId, @RequestParam(required = false) Integer quantity) {
        String message = null;

        if (quantity == null) {
            message = "장바구니 품목은 최소 1개 이상이어야 합니다.";
            return ResponseEntity.badRequest().body(message);
        }

        Optional<CartItems> cartItemOptional = cartItemService.findCartItemById(cartItemId);
        if (cartItemOptional.isEmpty()) {
            message = "장바구니 품목을 찾을 수 없습니다.";
            return ResponseEntity.badRequest().body(message);
        }

        CartItems cartItems = cartItemOptional.get();
        cartItems.setQuantity(quantity);
        cartItemService.saveCartItems(cartItems);

        message = "카트 상품 아이디 " + cartItemId + "번이 '" + quantity + "개'로 수정 되었습니다.";
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/delete/{cartItemId}")
    public ResponseEntity<String> deleteCartItems(@PathVariable Long cartItemId) {
        cartItemService.deleteCartItemById(cartItemId);
        String message = "카트 상품 " + cartItemId + "번이 장바구니 목록에서 삭제 되었습니다.";
        return ResponseEntity.ok(message);
    }
}