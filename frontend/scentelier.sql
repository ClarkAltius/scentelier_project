USE scentelier;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE scentelier;

show tables;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS cart_item;
DROP TABLE IF EXISTS cart;
SET FOREIGN_KEY_CHECKS = 1;

-- 필요시 기존 테이블 제거
-- DROP TABLE IF EXISTS cart_item;
-- DROP TABLE IF EXISTS cart;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS cart_item;
DROP TABLE IF EXISTS cart;

-- users / products / custom_perfume 는 건들지 않음 (이미 있다고 가정)

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE cart (
  cart_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '장바구니 고유 ID',
  user_id BIGINT NOT NULL COMMENT '장바구니 소유 유저 ID',
  PRIMARY KEY (cart_id),
  UNIQUE KEY uq_cart_user (user_id),
  KEY idx_cart_user_id (user_id),
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 재생성: cart_item
CREATE TABLE cart_item (
  cart_item_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '장바구니 항목 고유 id',
  cart_id      BIGINT NOT NULL COMMENT '장바구니 고유 ID',
  quantity     INT    NOT NULL DEFAULT 1 COMMENT '담은 수량',
  product_id   BIGINT NULL COMMENT '상품 ID',
  custom_id    BIGINT NULL COMMENT '커스텀향 ID',
  PRIMARY KEY (cart_item_id),
  KEY idx_cart_item_cart_id    (cart_id),
  KEY idx_cart_item_product_id (product_id),
  KEY idx_cart_item_custom_id  (custom_id),
  CONSTRAINT fk_cart_item_cart
    FOREIGN KEY (cart_id)    REFERENCES cart(cart_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_cart_item_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_cart_item_custom
    FOREIGN KEY (custom_id)  REFERENCES custom_perfume(custom_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

show tables;
SELECT * from products;

commit

-- SELECT product_id, name, is_deleted, deleted_at 
-- FROM products;

-- SELECT product_id, is_deleted, deleted_at FROM products WHERE product_id = ?;

