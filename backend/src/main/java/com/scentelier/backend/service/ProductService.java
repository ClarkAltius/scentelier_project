package com.scentelier.backend.service;

import com.scentelier.backend.entity.Products;
import com.scentelier.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository ;

    public void save(Products products) {
        this.productRepository.save(products);
    }

    public Optional<Products> findProductsById(Long productId) {
        return productRepository.findById(productId);
    }

    //상품 리스트 전체 가져오기 서비스
    public Page<Products> findAll(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Products ProductById(Long id) {
        Optional<Products> product = this.productRepository.findById(id);
        return product.orElse(null);
    }

    public boolean deleteProduct(Long id) {
        if(productRepository.existsById(id)){
            this.productRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }

    }


