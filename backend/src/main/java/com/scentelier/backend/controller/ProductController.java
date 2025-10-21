package com.scentelier.backend.controller;

import com.scentelier.backend.entity.Products;
import com.scentelier.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/product")
public class ProductController {

    @Value("${file.upload-dir}")
    private String productImageLocation; // 기본값 : null

    @Autowired
    private ProductService productService;

    // 상품 등록
    @PostMapping("/insert")
    public ResponseEntity<?> insert(@RequestBody Products products) {
        String imageFileName = "product_" + System.currentTimeMillis() + ".jpg";

        String pathName = productImageLocation.endsWith("\\") || productImageLocation.endsWith("/")
                ? productImageLocation
                : productImageLocation + File.separator;

        File imageFile = new File(pathName + imageFileName);
        String imageData = products.getImageUrl();

        try {
            FileOutputStream fos = new FileOutputStream(imageFile);

            byte[] decodedImage = Base64.getDecoder().decode(imageData.split(",")[1]);
            fos.write(decodedImage);

            products.setImageUrl(imageFileName);
            products.setCreatedAt(LocalDate.now());

            this.productService.save(products);

            return ResponseEntity.ok(Map.of("message", "Product insert successfully", "image", imageFileName));

        } catch (Exception err) {
            return ResponseEntity.status(500).body(Map.of("message", err.getMessage(), "error", "Error file uploading"));
        }
    }
}
