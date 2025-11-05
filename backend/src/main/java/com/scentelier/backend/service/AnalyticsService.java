package com.scentelier.backend.service;

import com.scentelier.backend.dto.analytics.MostUsedIngredientDto;
import com.scentelier.backend.dto.analytics.CategorySalesDto;
import com.scentelier.backend.dto.analytics.DailyAovDto;
import com.scentelier.backend.dto.analytics.CustomerBreakdownDto;
import com.scentelier.backend.dto.analytics.DailySalesDto;
import com.scentelier.backend.dto.analytics.ProductPerformanceDto;
import com.scentelier.backend.dto.analytics.TopCustomerDto;

import com.scentelier.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.Collections;
import com.scentelier.backend.repository.CustomPerfumeIngredientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
@RequiredArgsConstructor
public class AnalyticsService {

    // Inject repositories as needed
    // private final UserRepository userRepository;
    // private final ProductRepository productRepository;
    // ...etc


    private final OrderRepository orderRepository;
    private final OrderProductRepository orderProductRepository;
    private final CustomPerfumeIngredientRepository customPerfumeIngredientRepository;
    private final Random random = new Random();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);
    // --- MOCK DATA IMPLEMENTATIONS ---
    // We are keeping the mock data logic here in the service for now.

    public List<DailySalesDto> getSalesOverTime(LocalDate startDate, LocalDate endDate, String productType) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        return orderProductRepository.findDailySales(startDateTime, endDateTime, productType);
    }

    public List<DailyAovDto> getAovOverTime(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        return orderRepository.findDailyAov(startDateTime, endDateTime);
    }

    public List<CustomerBreakdownDto> getCustomerBreakdown(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<Object[]> results = orderRepository.findCustomerBreakdown(startDateTime, endDateTime);

        // Manual mapping from Object[] to DTO
        return results.stream()
                .map(row -> new CustomerBreakdownDto(
                        (String) row[0],                // date string
                        ((Number) row[1]).longValue(),  // new customers count
                        ((Number) row[2]).longValue()   // returning customers count
                ))
                .collect(Collectors.toList());
    }

    public List<CategorySalesDto> getSalesByCategory(LocalDate startDate, LocalDate endDate, String productType) {
        // 커스텀 향수 조회중이라면 빈 리스트 반환.
        if ("custom".equals(productType)) {
            return Collections.emptyList();
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        return orderProductRepository.findSalesByCategory(startDateTime, endDateTime);
    }

    public List<MostUsedIngredientDto> getPopularIngredients(LocalDate startDate, LocalDate endDate) {
        Pageable topTen = PageRequest.of(0, 10);
        return customPerfumeIngredientRepository.findMostUsedIngredients(topTen);
    }

    public List<ProductPerformanceDto> getProductPerformance(LocalDate startDate, LocalDate endDate, String productType, List<String> categories) {

        if ("custom".equals(productType)) {
            return Collections.emptyList();
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<String> categoryFilter = (categories != null && !categories.isEmpty()) ? categories : null;

        List<Object[]> results = orderProductRepository.findProductPerformanceNative(startDateTime, endDateTime, categoryFilter);

        logger.info("--- Product Performance Query Results ---");
        return results.stream()
                .map(row -> {
                    // Log the raw data from the SQL query
                    logger.info("Raw Row: [ID: {}, Name: {}, Cat: {}, Season: {}, Units: {}, Revenue: {}, AvgRating: {}, RepurchaseRate: {}]",
                            row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]);

                    return new ProductPerformanceDto(
                            ((Number) row[0]).longValue(),  // id (Long)
                            (String) row[1],                // name (String)
                            (String) row[2],                // category (String)
                            (String) row[3],                // season (String)
                            ((BigDecimal) row[4]).longValue(), // unitsSold (long)
                            ((BigDecimal) row[5]).longValue(), // revenue (long)
                            ((Number) row[6]).doubleValue(), // avgRating (double)
                            ((Number) row[7]).doubleValue()  // rePurchaseRate (double)
                    );
                })
                .collect(Collectors.toList());
    }

    public List<TopCustomerDto> getTopCustomers(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();

        // End of the day (e.g., 2025-11-05 -> 2025-11-05T23:59:59)
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        Pageable topTen = PageRequest.of(0, 10);

        return orderRepository.findTopCustomers(startDateTime, endDateTime, topTen);
    }
}