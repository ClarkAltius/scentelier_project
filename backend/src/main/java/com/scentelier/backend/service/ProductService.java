package com.scentelier.backend.service;

import com.scentelier.backend.entity.Products;
import com.scentelier.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository ;

    public void save(Products products) {
        this.productRepository.save(products);
    }
}
