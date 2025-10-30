package com.scentelier.backend.controller;

import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.constant.Role;
import com.scentelier.backend.dto.OrderDto;
import com.scentelier.backend.dto.OrderProductDto;
import com.scentelier.backend.dto.OrderResponseDto;
import com.scentelier.backend.entity.*;
import com.scentelier.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final OrderProductService OrderProductService;
    private final UserService userService;
    private final ProductService productService;
    private final CustomPerfumeService customPerfumeService;
    private final CartItemService cartItemService;
    private final IngredientService ingredientService;
    private final CustomPerfumeIngredientService customPerfumeIngredientService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderDto dto) {
        Optional<Users> optionalUsers = userService.findUserById(dto.getUserId());
        if (optionalUsers.isEmpty()) {
            throw new RuntimeException("회원이 존재하지 않습니다.");
        }
        Users users = optionalUsers.get();

        Orders orders = new Orders();
        orders.setUsers(users);
        orders.setRecipientName(dto.getRecipientName());
        orders.setPhone(dto.getPhone());
        orders.setAddress(dto.getAddress());
        orders.setTotalPrice(dto.getTotalPrice());
        orders.setStatus(dto.getStatus());
        orders.setPaymentMethod(dto.getPaymentMethod());

        List<OrderProduct> orderProductList = new ArrayList<>();
        for (OrderProductDto item : dto.getOrderProducts()) {
            OrderProduct orderProduct = new OrderProduct();
            if (item.getProductId() != null) {
                Products products = productService.findProductsById(item.getProductId())
                        .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));
                orderProduct.setProducts(products);
                // 상품의 재고 수량 빼기
                products.setStock(products.getStock() - item.getQuantity());
                productService.save(products);
            } else if (item.getCustomId() != null) {
                CustomPerfume customPerfume = customPerfumeService.findCustomPerfumeById(item.getCustomId())
                        .orElseThrow(() -> new RuntimeException("커스텀 향수가 존재하지 않습니다."));
                orderProduct.setCustomPerfume(customPerfume);
                customPerfumeIngredientService.reduceIngredientStock(customPerfume, item.getQuantity());
            }
            // 카트에 담겨있던 품목을 삭제
            Long cartItemId = item.getCartItemId();

            if (cartItemId != null) {
                cartItemService.deleteCartItemById(cartItemId);
            }

            orderProduct.setOrders(orders);
            orderProduct.setQuantity(item.getQuantity());
            orderProduct.setPrice(item.getPrice());

            orderProductList.add(orderProduct);
        }
        orders.setOrderProducts(orderProductList);
        orderService.save(orders);

        return ResponseEntity.ok(Map.of("message", "주문이 성공적으로 생성되었습니다."));
    }

    @GetMapping("/list")
    public ResponseEntity<List<Products>> getBestList() {
        List<Products> products = orderService.getBestList();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/list2")
    public ResponseEntity<List<Products>> getBestList2() {
        List<Products> products = orderService.getBestList2();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/ordered")
    public ResponseEntity<List<OrderResponseDto>> getOrderList(@RequestParam Long userId, @RequestParam Role role) {
        List<Orders> orders = null;

        if(role == Role.ADMIN) {
            // orders = orderService.findAllOrders(OrderStatus.PENDING);
        } else {
            orders = orderService.findByUserId(userId);
        }

        List<OrderResponseDto> responseDtos = new ArrayList<>();

        for (Orders bean : orders) {
            OrderResponseDto dto = new OrderResponseDto();
            dto.setOrderId(bean.getId());
            dto.setOrderDate(bean.getOrderDate());
            dto.setStatus(bean.getStatus().name());
            dto.setRecipientName(bean.getRecipientName());
            dto.setAddress(bean.getAddress());
            dto.setTotalPrice(bean.getTotalPrice());
            dto.setTrackingNumber(bean.getTrackingNumber());
            dto.setPaymentMethod(bean.getPaymentMethod().name());

            List<OrderResponseDto.OrderItem> orderItems = new ArrayList<>();
            for (OrderProduct op : bean.getOrderProducts()) {
                OrderResponseDto.OrderItem oi = null;
                if (op.getProducts() != null) {
                    oi = new OrderResponseDto.OrderItem(op.getProducts().getId(), null, op.getProducts().getName(), op.getQuantity(), op.getPrice());
                    orderItems.add(oi);
                } else if (op.getCustomPerfume() != null){
                    oi = new OrderResponseDto.OrderItem(null, op.getCustomPerfume().getId(), op.getCustomPerfume().getName(), op.getQuantity(), op.getPrice());
                    orderItems.add(oi);
                }
            }
            dto.setOrderItems(orderItems);

            responseDtos.add(dto);
        }

        return ResponseEntity.ok(responseDtos);
    }

    @PutMapping("/update/status/{orderId}")
    public ResponseEntity<String> statusChange(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        int effected = -1;
        effected = orderService.updateUserOrderStatus(orderId, status);
        if (effected > 0) {
            if (status == OrderStatus.CANCELLED) {
                List<OrderProduct> orderProducts = OrderProductService.findByOrderId(orderId);
                for (OrderProduct item : orderProducts) {
                    if (item.getProducts() != null) {
                        Products products = productService.ProductById(item.getProducts().getId());
                        products.setStock(products.getStock()+item.getQuantity());
                        productService.save(products);
                    }
                }
            }
            String message = "주문 번호 " + orderId + "의 주문 상태가 변경 되었습니다.";
            return ResponseEntity.ok(message);
        } else {
            return ResponseEntity.badRequest().body("error");
        }
    }
}
