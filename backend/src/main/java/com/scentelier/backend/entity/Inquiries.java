package com.scentelier.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "inquiries") // Make sure the table name is correct!
public class Inquiries {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    // You don't need any other fields.
    // This is just a placeholder.
}