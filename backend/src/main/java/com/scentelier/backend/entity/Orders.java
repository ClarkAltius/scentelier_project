package com.scentelier.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.scentelier.backend.constant.OrderStatus;
import com.scentelier.backend.constant.Payment;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private Payment paymentMethod;

    @CreationTimestamp
    @Column(name = "order_date", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate orderDate;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderProduct> orderProducts;
}
