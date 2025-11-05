package com.scentelier.backend.service;

import com.scentelier.backend.dto.MostUsedIngredientDto;
import com.scentelier.backend.dto.analytics.*;
import com.scentelier.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    // Inject repositories as needed
    // private final UserRepository userRepository;
    // private final ProductRepository productRepository;
    // ...etc

    private final OrderRepository orderRepository;
    private final OrderProductRepository orderProductRepository;

    private final Random random = new Random();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // --- MOCK DATA IMPLEMENTATIONS ---
    // We are keeping the mock data logic here in the service for now.

    public List<DailySalesDto> getSalesOverTime(LocalDate startDate, LocalDate endDate, String productType) {
        List<DailySalesDto> data = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            long sales = random.nextInt(50000, 450000);
            if ("finished".equals(productType)) sales *= 0.7;
            if ("custom".equals(productType)) sales *= 0.3;
            data.add(new DailySalesDto(date.format(DATE_FORMATTER), (double) sales));
        }
        return data;
    }

    public List<DailyAovDto> getAovOverTime(LocalDate startDate, LocalDate endDate) {
        List<DailyAovDto> data = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            double aov = random.nextInt(65000, 110000);
            data.add(new DailyAovDto(date.format(DATE_FORMATTER), aov));
        }
        return data;
    }

    public List<CustomerBreakdownDto> getCustomerBreakdown(LocalDate startDate, LocalDate endDate) {
        List<CustomerBreakdownDto> data = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            data.add(new CustomerBreakdownDto(
                    date.format(DATE_FORMATTER),
                    random.nextInt(5, 30),
                    random.nextInt(20, 60)
            ));
        }
        return data;
    }

    public List<CategorySalesDto> getSalesByCategory(LocalDate startDate, LocalDate endDate, String productType) {
        String[] categories = {"Floral", "Woody", "Citrus", "Oriental", "Fruity", "Spicy"};
        List<CategorySalesDto> data = new ArrayList<>();
        for (String cat : categories) {
            long revenue = random.nextInt(1000000, 5000000);
            data.add(new CategorySalesDto(cat, revenue));
        }
        return data;
    }

    public List<MostUsedIngredientDto> getPopularIngredients(LocalDate startDate, LocalDate endDate) {
        String[] ingredients = {"Rose", "Sandalwood", "Bergamot", "Jasmine", "Vanilla", "Patchouli", "Oud", "Vetiver"};
        List<MostUsedIngredientDto> data = new ArrayList<>();

        // --- START OF FIX ---
        int id = 1; // Use int for Integer
        for (String name : ingredients) {
            // Create a BigDecimal from the random number
            BigDecimal usage = new BigDecimal(random.nextInt(50, 500));
            // Pass the correct types (int, String, BigDecimal)
            data.add(new MostUsedIngredientDto(id++, name, usage));
        }

        // Use BigDecimal.compareTo for sorting
        return data.stream()
                .sorted((a, b) -> b.getUsage().compareTo(a.getUsage())) // b.compareTo(a) for descending
                .collect(Collectors.toList());
        // --- END OF FIX ---
    }

    public List<ProductPerformanceDto> getProductPerformance(LocalDate startDate, LocalDate endDate, String productType, List<String> categories) {
        String[] names = {"Midnight Bloom", "Forest Whisper", "Sunrise Sparkle", "Amber Evening", "Coastal Drive", "Spiced Noir"};
        String[] cats = {"Floral", "Woody", "Citrus", "Oriental", "Aromatic", "Spicy"};
        String[] seasons = {"SPRING", "AUTUMN", "SUMMER", "WINTER", "ALL", "SPRING"};

        List<ProductPerformanceDto> data = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            data.add(new ProductPerformanceDto(
                    (long) i + 1,
                    names[i % names.length] + (i > 5 ? " II" : ""),
                    cats[i % cats.length],
                    seasons[i % seasons.length],
                    random.nextInt(50, 300),
                    random.nextInt(3000000, 15000000),
                    3.0 + (random.nextDouble() * 2.0), // 3.0 to 5.0
                    random.nextDouble() * 0.25 // 0 to 25%
            ));
        }
        return data;
    }

    public List<TopCustomerDto> getTopCustomers(LocalDate startDate, LocalDate endDate) {
        String[] domains = {"gmail.com", "naver.com", "example.com", "kakao.com"};
        List<TopCustomerDto> data = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            data.add(new TopCustomerDto(
                    (long) 100 + i,
                    "user" + random.nextInt(100, 999) + "@" + domains[i % domains.length],
                    random.nextInt(3, 25),
                    random.nextInt(200000, 2500000)
            ));
        }
        return data.stream()
                .sorted((a, b) -> Long.compare(b.getTotalSpent(), a.getTotalSpent()))
                .collect(Collectors.toList());
    }
}