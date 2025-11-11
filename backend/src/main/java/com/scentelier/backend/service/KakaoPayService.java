package com.scentelier.backend.service;

import com.scentelier.backend.entity.OrderProduct;
import com.scentelier.backend.entity.Orders;
import com.scentelier.backend.constant.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class KakaoPayService {

    @Value("${kakaopay.admin-key}")
    private String adminKey;
    @Value("${kakaopay.cid}")
    private String cid;
    @Value("${kakaopay.approval-url}")
    private String approvalUrl;
    @Value("${kakaopay.cancel-url}")
    private String cancelUrl;
    @Value("${kakaopay.fail-url}")
    private String failUrl;

    private final OrderService orderService;
    private final RestTemplate restTemplate = new RestTemplate();

    // 결제 준비
    public Map<String, String> readyKakaoPay(Orders order) {
        String url = "https://open-api.kakaopay.com/online/v1/payment/ready";

        HttpHeaders headers = new HttpHeaders();
        headers.add("Host", "open-api.kakaopay.com");
        headers.add("Authorization", "SECRET_KEY " + adminKey);
        headers.add("Content-Type", "application/json");

        Map<String, String> params = new HashMap<>();
        params.put("cid", "TC0ONETIME");
        params.put("partner_order_id", order.getId().toString());
        params.put("partner_user_id", order.getUsers().getId().toString());
        List<OrderProduct> products = order.getOrderProducts();
        String itemName = "";
        if (!products.isEmpty()) {
            itemName = products.get(0).getProducts() != null
                    ? products.get(0).getProducts().getName()
                    : products.get(0).getCustomPerfume().getName();

            int extraCount = products.size() - 1;
            if (extraCount > 0) {
                itemName += " 외 " + extraCount + "종";
            }
        }
        params.put("item_name", itemName);
        int totalQuantity = order.getOrderProducts().stream()
                .mapToInt(OrderProduct::getQuantity)
                .sum();

        params.put("quantity", String.valueOf(totalQuantity));
        params.put("total_amount", String.valueOf(order.getTotalPrice().intValue()));
        params.put("tax_free_amount", "0");
        params.put("approval_url", approvalUrl + "?orderId=" + order.getId());
        params.put("cancel_url", cancelUrl);
        params.put("fail_url", failUrl);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        Map<String, String> result = new HashMap<>();
        result.put("next_redirect_pc_url", (String) response.getBody().get("next_redirect_pc_url"));
        result.put("tid", (String) response.getBody().get("tid"));

        // 임시 저장
        order.setTrackingNumber(result.get("tid"));
        order.setStatus(OrderStatus.PENDING);
        orderService.save(order);

        return result;
    }

    // 결제 승인
    public Map<String, Object> approveKakaoPay(Long orderId, String pgToken) {
        Orders order = orderService.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

        String url = "https://open-api.kakaopay.com/online/v1/payment/approve";

        HttpHeaders headers = new HttpHeaders();
        headers.add("Host", "open-api.kakaopay.com");
        headers.add("Authorization", "SECRET_KEY " + adminKey);
        headers.add("Content-Type", "application/json");

        Map<String, String> params = new HashMap<>();
        params.put("cid", cid);
        params.put("tid", order.getTrackingNumber());
        params.put("partner_order_id", order.getId().toString());
        params.put("partner_user_id", order.getUsers().getId().toString());
        params.put("pg_token", pgToken);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        order.setStatus(OrderStatus.PAID);
        orderService.save(order);

        return response.getBody();
    }
}
