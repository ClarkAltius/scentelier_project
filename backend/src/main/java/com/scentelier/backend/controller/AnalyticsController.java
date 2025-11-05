package com.scentelier.backend.controller;

import com.scentelier.backend.dto.analytics.MostUsedIngredientDto;
import com.scentelier.backend.dto.analytics.*;
import com.scentelier.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Fetches daily sales data for a given date range and product type.
     */
    @GetMapping("/sales-over-time")
    public ResponseEntity<List<DailySalesDto>> getSalesOverTime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String productType) {

        // The service will handle the logic (e.g., using mock data for now)
        List<DailySalesDto> data = analyticsService.getSalesOverTime(startDate, endDate, productType);
        return ResponseEntity.ok(data);
    }

    /**
     * Fetches daily Average Order Value (AOV) for a given date range.
     */
    @GetMapping("/aov-over-time")
    public ResponseEntity<List<DailyAovDto>> getAovOverTime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<DailyAovDto> data = analyticsService.getAovOverTime(startDate, endDate);
        return ResponseEntity.ok(data);
    }

    /**
     * Fetches daily breakdown of new vs. returning customers.
     */
    @GetMapping("/customer-breakdown")
    public ResponseEntity<List<CustomerBreakdownDto>> getCustomerBreakdown(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<CustomerBreakdownDto> data = analyticsService.getCustomerBreakdown(startDate, endDate);
        return ResponseEntity.ok(data);
    }

    /**
     * Fetches revenue breakdown by product category.
     */
    @GetMapping("/sales-by-category")
    public ResponseEntity<List<CategorySalesDto>> getSalesByCategory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String productType) {

        List<CategorySalesDto> data = analyticsService.getSalesByCategory(startDate, endDate, productType);
        return ResponseEntity.ok(data);
    }

    /**
     * Fetches most popular ingredients used in custom perfumes.
     */
    @GetMapping("/popular-ingredients")
    public ResponseEntity<List<MostUsedIngredientDto>> getPopularIngredients(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // We can reuse the DTO from the main dashboard for this
        List<MostUsedIngredientDto> data = analyticsService.getPopularIngredients(startDate, endDate);
        return ResponseEntity.ok(data);
    }

    /**
     * Fetches a detailed performance report for all products.
     */
    @GetMapping("/product-performance")
    public ResponseEntity<List<ProductPerformanceDto>> getProductPerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String productType,
            @RequestParam(required = false) List<String> categories) {

        List<ProductPerformanceDto> data = analyticsService.getProductPerformance(startDate, endDate, productType, categories);
        return ResponseEntity.ok(data);
    }

    /**
     * Fetches a list of top customers by spending.
     */
    @GetMapping("/top-customers")
    public ResponseEntity<List<TopCustomerDto>> getTopCustomers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<TopCustomerDto> data = analyticsService.getTopCustomers(startDate, endDate);
        return ResponseEntity.ok(data);
    }
}