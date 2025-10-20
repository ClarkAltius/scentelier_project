package com.scentelier.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "ingredients") // Make sure the table name is correct!
public class Ingredients {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    // A name field is useful for testing
    private String name;

    public Ingredients(String name) {
        this.name = name;
    }
}