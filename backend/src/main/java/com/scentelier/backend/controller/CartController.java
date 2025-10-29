package com.scentelier.backend.controller;

import com.scentelier.backend.dto.CartItemDto;
import com.scentelier.backend.dto.CartItemResponseDto;
import com.scentelier.backend.entity.*;
import com.scentelier.backend.service.*;
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
    private final CustomPerfumeService customPerfumeService;

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
                if(ci.getProduct() != null) {
                    if (ci.getProduct().getId().equals(dto.getProductId())) {
                        existingCartItems = ci;
                        break;
                    }
                } else {
                    if (ci.getCustomPerfume().getId().equals(dto.getCustomId())) {
                        existingCartItems = ci;
                        break;
                    }
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


//    ----------------------------------------
@PostMapping("/insert/custom")
public ResponseEntity<String> addCustomToCart(@RequestBody CartItemDto dto) {


    // 1. 필수 값 null 체크
    if (dto.getUserId() == null || dto.getCustomId() == null) {
        System.out.println("확인하기"+dto.getUserId()+dto.getCustomId());
        return ResponseEntity.badRequest().body("회원 ID와 향수 ID는 필수입니다.");
    }

    // 2. 유저 조회
    Optional<Users> userOptional = userService.findUserById(dto.getUserId());
    if (userOptional.isEmpty()) {
        return ResponseEntity.badRequest().body("회원 정보를 찾을 수 없습니다.");
    }
    Users users = userOptional.get();

    // 3. 커스텀 향수 조회
    Optional<CustomPerfume> customOptional = customPerfumeService.findCustomPerfumeById(dto.getCustomId());
    if (customOptional.isEmpty()) {
        return ResponseEntity.badRequest().body("향수 정보를 찾을 수 없습니다.");
    }
    CustomPerfume customPerfume = customOptional.get();

    // 4. 장바구니 조회 또는 생성
    Carts cart = cartService.findByUsers(users);
    if (cart == null) {
        cart = new Carts();
        cart.setUser(users);
        cart = cartService.saveCart(cart);
    }
    CartItems newItem = new CartItems();
    newItem.setCart(cart);
    newItem.setCustomPerfume(customPerfume);
    newItem.setQuantity(dto.getQuantity());
    cartItemService.saveCartItems(newItem);


    // 7. 최종 응답
    return ResponseEntity.ok("요청하신 상품이 장바구니에 추가되었습니다.");
}


//    ----------------------------------------

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