package com.scentelier.backend.controller;

import com.scentelier.backend.dto.*;
import com.scentelier.backend.dto.analytics.MostUsedIngredientDto;
import com.scentelier.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    public ResponseEntity<DashboardKpiDto> getKpis() {
        return ResponseEntity.ok(dashboardService.getKpis());
    }

    @GetMapping("/sales-breakdown")
    public ResponseEntity<SalesBreakdownDto> getSalesBreakdown() {
        return ResponseEntity.ok(dashboardService.getSalesBreakdown());
    }

    @GetMapping("/operational-data")
    public ResponseEntity<OperationalDataDto> getOperationalData() {
        return ResponseEntity.ok(dashboardService.getOperationalData());
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<BestSellerDto>> getBestSellers() {
        return ResponseEntity.ok(dashboardService.getBestSellers());
    }

    @GetMapping("/most-used-ingredients")
    public ResponseEntity<List<MostUsedIngredientDto>> getMostUsedIngredients() {
        return ResponseEntity.ok(dashboardService.getMostUsedIngredients());
    }

    @GetMapping("/low-stock-items")
    public ResponseEntity<List<LowStockItemDto>> getLowStockItems() {
        return ResponseEntity.ok(dashboardService.getLowStockItems());
    }

    @GetMapping("/monthly-sales")
    public ResponseEntity<List<MonthlySalesDto>> getMonthlySales() {
        return ResponseEntity.ok(dashboardService.getMonthlySales());
    }
}