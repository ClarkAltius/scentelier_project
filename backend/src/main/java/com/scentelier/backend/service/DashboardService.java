package com.scentelier.backend.service;

import com.scentelier.backend.constant.InquiryStatus;
import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.dto.*;
import com.scentelier.backend.dto.analytics.MostUsedIngredientDto;
import com.scentelier.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DashboardService {

    // ========= 모든 필요 리포지토리 인젝션 =========
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;
    private final OrderProductRepository orderProductRepository;
    private final CustomPerfumeIngredientRepository customPerfumeIngredientRepository;
    private final ProductRepository productRepository;
    private final IngredientRepository ingredientRepository;
    // ===========================================

    private static final int LOW_STOCK_THRESHOLD_PRODUCT = 20;
    private static final int LOW_STOCK_THRESHOLD_INGREDIENT = 200;
    private static final int LOW_STOCK_LIST_LIMIT = 5;
    private static final int BEST_SELLER_LIMIT = 3;
    private static final int POPULAR_INGREDIENT_LIMIT = 3;

    public DashboardKpiDto getKpis() {
        long totalRevenue = orderRepository.sumTotalRevenue();
        int totalOrders = (int) orderRepository.count();

        // 1. Java 에서 날짜 계산
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);

        // 2. 날짜 파라미터로 전달
        int newCustomers = userRepository.countNewUsersSince(thirtyDaysAgo);

        return new DashboardKpiDto(totalRevenue, totalOrders, newCustomers);
    }

    public SalesBreakdownDto getSalesBreakdown() {
        List<Object[]> results = orderProductRepository.findSalesBreakdownByType();
        long finishedSales = 0L;
        long customSales = 0L;

        for (Object[] result : results) {
            String type = (String) result[0];
            // The SUM might return BigDecimal or Double, handle defensively
            Number salesNumber = (Number) result[1];
            long sales = (salesNumber != null) ? salesNumber.longValue() : 0L;

            if ("FINISHED".equals(type)) {
                finishedSales = sales;
            } else if ("CUSTOM".equals(type)) {
                customSales = sales;
            }
        }
        return new SalesBreakdownDto(finishedSales, customSales);
    }

    public OperationalDataDto getOperationalData() {
        int pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        int openInquiries = inquiryRepository.countByStatus(InquiryStatus.PENDING);
        return new OperationalDataDto(pendingOrders, openInquiries);
    }

    public List<BestSellerDto> getBestSellers() {
        Pageable limit = PageRequest.of(0, BEST_SELLER_LIMIT);
        return orderProductRepository.findBestSellers(limit);
    }

    public List<MostUsedIngredientDto> getMostUsedIngredients() {
        Pageable limit = PageRequest.of(0, POPULAR_INGREDIENT_LIMIT); // Get top 3
        return customPerfumeIngredientRepository.findMostUsedIngredients(limit);
    }

    public List<LowStockItemDto> getLowStockItems() {
        Pageable limit = PageRequest.of(0, LOW_STOCK_LIST_LIMIT);

        // 1. 재고 적은 완제품 가져오기
        List<LowStockItemDto> lowStockProducts = productRepository
                .findByIsDeletedFalseAndStockLessThan(LOW_STOCK_THRESHOLD_PRODUCT, limit)
                .stream()
                .map(product -> new LowStockItemDto(
                        product.getId().intValue(),
                        product.getName(),
                        product.getStock(),
                        "Product"
                ))
                .toList();

        // 2. 재고 적인 원액 가져오기
        List<LowStockItemDto> lowStockIngredients = ingredientRepository
                .findByStockLessThan(LOW_STOCK_THRESHOLD_INGREDIENT, limit)
                .stream()
                .map(ingredient -> new LowStockItemDto(
                        ingredient.getId().intValue(),
                        ingredient.getName(),
                        ingredient.getStock(),
                        "Ingredient"
                ))
                .toList();

        // 3. 리스트 융합, 재고수량 기준으로 재정렬, 최상단 아이템 반환
        return Stream.concat(lowStockProducts.stream(), lowStockIngredients.stream())
                .sorted((a, b) -> Integer.compare(a.getStock(), b.getStock())) // 가장 적은 것 순으로 정렬
                .limit(LOW_STOCK_LIST_LIMIT) // 최대 '재고부족'리스트 반환 제한에 맞추기
                .collect(Collectors.toList());
    }

    public List<MonthlySalesDto> getMonthlySales() {
        List<Object[]> results = orderRepository.findMonthlySales();

        return results.stream()
                .map(result -> {
                    String month = (String) result[0];
                    // SUM은 BigDecimal 반환. 에러 대비
                    BigDecimal salesDecimal = (BigDecimal) result[1];
                    long sales = (salesDecimal != null) ? salesDecimal.longValue() : 0L;
                    return new MonthlySalesDto(month, sales);
                })
                // 총 12달 표기
                 .limit(12)
                .collect(Collectors.toList());
    }
}