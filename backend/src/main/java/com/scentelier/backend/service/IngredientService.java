package com.scentelier.backend.service;

import com.scentelier.backend.dto.IngredientStockDto;
import com.scentelier.backend.entity.CustomPerfume;
import com.scentelier.backend.entity.CustomPerfumeIngredient;
import com.scentelier.backend.entity.Ingredient;
import com.scentelier.backend.entity.OrderProduct;
import com.scentelier.backend.repository.IngredientRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

// 주문 취소 이벤트 & 리스너
import com.scentelier.backend.event.OrderCancelledEvent;
import org.springframework.context.event.EventListener;

@Service
@RequiredArgsConstructor
public class IngredientService {
    private final IngredientRepository ingredientRepository;

    public void save(Ingredient ingredient) {
        ingredientRepository.save(ingredient);
    }

    // 상품 재고 가져오기 서비스
    public List<IngredientStockDto> getIngredientStock() {
        return ingredientRepository.findAll().stream()
                .map(ingredient -> new IngredientStockDto(ingredient.getId(), ingredient.getName(), ingredient.getStock()))
                .collect(Collectors.toList());
    }

    public List<Ingredient> findAll() {
        List<Ingredient> ingredients = ingredientRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));

        return ingredientRepository.findAll();
    }

    @Transactional
    public IngredientStockDto updateStock(Long itemId, @NotNull(message = "Stock value cannot be null.") Integer newStock) {

        Ingredient ingredient = ingredientRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Ingredient not found with id: " + itemId));

        int currentStock = ingredient.getStock();
        ingredient.setStock(newStock + currentStock);
        Ingredient updatedIngredient = ingredientRepository.save(ingredient);

        return new IngredientStockDto(updatedIngredient.getId(), updatedIngredient.getName(), updatedIngredient.getStock());
    }

    //주문 취소 이벤트 수신, 커스텀 향수에 사용된 원액 재고를 롤백
    @EventListener // 3. 이벤트를 수신
    @Transactional  // 4. 트랜잭션 내에서 실행
    public void handleOrderCancellation(OrderCancelledEvent event) {
        System.out.println("IngredientService: 주문 취소 이벤트 수신 (Order ID: " + event.getCancelledOrder().getId() + ")");

        // 취소된 주문의 모든 항목(OrderProduct)을 반복
        for (OrderProduct item : event.getCancelledOrder().getOrderProducts()) {
            // 해당 항목이 '커스텀 향수'인지 확인
            CustomPerfume customPerfume = item.getCustomPerfume();
            if (customPerfume != null) {
                // 이 항목(커스텀 향수)이 주문된 수량 fetch
                int orderQuantity = item.getQuantity();

                // 커스텀 향수를 구성하는 모든 '원액 조합(CustomPerfumeIngredient)'을 반복
                for (CustomPerfumeIngredient cpi : customPerfume.getCustomPerfumeIngredients()) {
                    Ingredient ingredient = cpi.getIngredients();
                    if (ingredient != null) {
                        // 향수 1개당 사용된 원액의 양
                        @NotNull(message = "비율을 선택해주세요.") BigDecimal amountPerPerfume = cpi.getAmount();

                        // 롤백할 총 원액의 양 = (향수 1개당 사용량) * (주문된 향수 수량)
                        int restockAmount = amountPerPerfume.multiply(BigDecimal.valueOf(orderQuantity)).intValue();

                        // 원액의 현재 재고를 가져와 롤백할 양 가산
                        int currentStock = ingredient.getStock();
                        ingredient.setStock(currentStock + restockAmount);

                        // 변경된 재고를 데이터베이스에 저장
                        ingredientRepository.save(ingredient);
                        System.out.println("IngredientService: ... 원료 '" + ingredient.getName() + "' 재고 " + restockAmount + "만큼 복구 완료 (현재 재고: " + ingredient.getStock() + ")");
                    }
                }
            }
        }
    }
}
