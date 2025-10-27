package com.scentelier.backend.controller;

import com.scentelier.backend.entity.Products;
import com.scentelier.backend.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//페이징 임포트
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.util.Base64;
import java.util.Map;

@Slf4j
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

    //상품 목록 보기 API

    @GetMapping("/list")
    public ResponseEntity<Page<Products>> getProductList(Pageable pageable) {
        //pageable 객체는 Spring이 자동으로 생성!
        Page<Products> productsPage = productService.findAll(pageable);
        return ResponseEntity.ok(productsPage);
    }

    //상품 상세

    @GetMapping("detail/{id}")
    public ResponseEntity<Products> detail(@PathVariable Long id) {
        Products product = this.productService.ProductById(id);

        if (product == null) {//404응답
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } else {
            //200 ok응답
            return ResponseEntity.ok(product);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        log.info("[SOFTDELETE] /product/{} reached", id);
        try {
            boolean isDeleted = this.productService.softDelete(id);

            if (isDeleted) {
                return ResponseEntity.ok(id + "상품이 삭제 되었습니다.");
            } else {
                return ResponseEntity.badRequest().body(id + "상품이 존재하지 않습니다.");
            }
        } catch (org.springframework.dao.DataIntegrityViolationException err) {
            String message = "해당 상품은 장바구니에 포함되어 있거나, \n 이미 매출이 발생한 상품입니다.";
            return ResponseEntity.badRequest().body(message);
        } catch (Exception err) {
            return ResponseEntity.internalServerError().body("오류 발생: " + err.getMessage());
        }
    }

    }
