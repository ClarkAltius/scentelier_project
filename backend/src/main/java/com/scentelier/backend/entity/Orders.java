package com.scentelier.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.constant.Payment;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @ToString
@Entity @Table(name = "orders")
public class Orders {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users users;

    @NotBlank(message = "수령자 이름은 필수 입력 사항입니다.")
    @Column(name = "recipient_name")
    private String recipientName;

    private String phone;

    @NotBlank(message = "배송지는 필수 입력 사항입니다.")
    private String address;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "total_price")
    @NotNull(message = "가격은 비어 있을 수 없습니다.")
    @DecimalMin(value = "0.0", inclusive = false, message = "가격은 0보다 커야 합니다.")
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private Payment paymentMethod;

    @CreationTimestamp
    @Column(name = "order_date", updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderProduct> orderProducts = new ArrayList<>();
}
