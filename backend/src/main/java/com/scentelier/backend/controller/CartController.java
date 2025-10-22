package com.scentelier.backend.controller;

import com.scentelier.backend.dto.CartItemDto;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final UserService userService;
    private final ProductService productService;
    private final CartService cartService;
    private final CartItemService cartItemService;

    /*
    @PostMapping("/insert")
    public ResponseEntity<String> addToCart(@RequestBody CartItemDto dto){
        // Member 또는 Product이 유효한 정보인지 확인
        Optional<Users> memberOptional = userService.findUserById(dto.getUserId());
        Optional<Products> productOptional = productService.findProductsById(dto.getProductId()) ;

        if(memberOptional.isEmpty() || productOptional.isEmpty()){
            return ResponseEntity.badRequest().body("회원 또는 상품 정보가 올바르지 않습니다.");
        }

        Users users = memberOptional.get();
        Products products = productOptional.get();

        // 재고가 충분한지 확인
        if(products.getStock() < dto.getQuantity()){
            return ResponseEntity.badRequest().body("재고 수량이 부족합니다.");
        }

        // Cart 조회 또는 신규 작성
        Carts cart = cartService.findByUser(users);

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
    */

}
