USE scentelier;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- cart / cart_item 존재 확인 및 생성
CREATE TABLE IF NOT EXISTS cart (
  cart_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '장바구니 고유 ID',
  user_id BIGINT NOT NULL COMMENT '장바구니 소유 유저 ID',
  PRIMARY KEY (cart_id),
  UNIQUE KEY uq_cart_user (user_id),
  KEY idx_cart_user_id (user_id),
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_item (
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

-- status 기본값 통일
ALTER TABLE products MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'SELLING';
UPDATE products SET status = 'SELLING'
WHERE status IS NULL OR status NOT IN ('SELLING','STOPPED','PENDING');

DELIMITER $$

-- 주문 + 장바구니 기준으로 상품 상태 자동 재계산
DROP PROCEDURE IF EXISTS sp_recompute_product_status $$
CREATE PROCEDURE sp_recompute_product_status(IN p_product_id BIGINT)
BEGIN
  DECLARE v_cart_cnt BIGINT DEFAULT 0;
  DECLARE v_order_cnt BIGINT DEFAULT 0;

  -- 장바구니 수량
  SELECT COUNT(*) INTO v_cart_cnt
  FROM cart_item
  WHERE product_id = p_product_id;

  -- 주문 상태 중 진행중인 것만 계산
  -- DELIVERED, CANCELLED 은 완료 또는 취소된 주문으로 간주
  SELECT COUNT(*) INTO v_order_cnt
  FROM order_product op
  JOIN orders o ON o.order_id = op.order_id
  WHERE op.product_id = p_product_id
    AND o.status NOT IN ('DELIVERED', 'CANCELLED');

  IF v_cart_cnt > 0 OR v_order_cnt > 0 THEN
    UPDATE products SET status = 'PENDING'
    WHERE product_id = p_product_id AND status <> 'STOPPED';
  ELSE
    UPDATE products SET status = 'SELLING'
    WHERE product_id = p_product_id AND status <> 'STOPPED';
  END IF;
END $$

-- 장바구니 트리거 (담기, 삭제, 수정 시)
DROP TRIGGER IF EXISTS trg_cart_item_ai $$
CREATE TRIGGER trg_cart_item_ai
AFTER INSERT ON cart_item
FOR EACH ROW
  CALL sp_recompute_product_status(NEW.product_id) $$

DROP TRIGGER IF EXISTS trg_cart_item_ad $$
CREATE TRIGGER trg_cart_item_ad
AFTER DELETE ON cart_item
FOR EACH ROW
  CALL sp_recompute_product_status(OLD.product_id) $$

DROP TRIGGER IF EXISTS trg_cart_item_au $$
CREATE TRIGGER trg_cart_item_au
AFTER UPDATE ON cart_item
FOR EACH ROW
BEGIN
  IF OLD.product_id <> NEW.product_id THEN
    CALL sp_recompute_product_status(OLD.product_id);
    CALL sp_recompute_product_status(NEW.product_id);
  END IF;
END $$

-- 주문 상품 트리거
DROP TRIGGER IF EXISTS trg_order_product_ai $$
CREATE TRIGGER trg_order_product_ai
AFTER INSERT ON order_product
FOR EACH ROW
  CALL sp_recompute_product_status(NEW.product_id) $$

DROP TRIGGER IF EXISTS trg_order_product_ad $$
CREATE TRIGGER trg_order_product_ad
AFTER DELETE ON order_product
FOR EACH ROW
  CALL sp_recompute_product_status(OLD.product_id) $$

DROP TRIGGER IF EXISTS trg_order_product_au $$
CREATE TRIGGER trg_order_product_au
AFTER UPDATE ON order_product
FOR EACH ROW
BEGIN
  IF OLD.product_id <> NEW.product_id THEN
    CALL sp_recompute_product_status(OLD.product_id);
    CALL sp_recompute_product_status(NEW.product_id);
  END IF;
END $$

-- 주문 상태 변경 시 포함된 상품 전체 재계산
DROP TRIGGER IF EXISTS trg_orders_au $$
CREATE TRIGGER trg_orders_au
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_product_id BIGINT;

  DECLARE cur CURSOR FOR
    SELECT DISTINCT op.product_id
    FROM order_product op
    WHERE op.order_id = NEW.order_id;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_product_id;
    IF done = 1 THEN
      LEAVE read_loop;
    END IF;
    CALL sp_recompute_product_status(v_product_id);
  END LOOP;
  CLOSE cur;
END $$

-- 판매중지 제한: 장바구니나 주문이 걸려 있으면 STOPPED 불가
DROP TRIGGER IF EXISTS trg_products_bu_block_stop $$
CREATE TRIGGER trg_products_bu_block_stop
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
  IF OLD.status <> 'STOPPED' AND NEW.status = 'STOPPED' THEN
    IF (SELECT COUNT(*) FROM cart_item WHERE product_id = OLD.product_id) > 0
       OR
       (SELECT COUNT(*)
        FROM order_product op
        JOIN orders o ON o.order_id = op.order_id
        WHERE op.product_id = OLD.product_id
          AND o.status NOT IN ('DELIVERED','CANCELLED')) > 0
    THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '진행 중인 주문 또는 장바구니에 담긴 상품은 판매중지할 수 없습니다.';
    END IF;
  END IF;
END $$

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- 상품목록 보이기
ALTER TABLE products ADD COLUMN is_deleted BOOLEAN DEFAULT 0;
UPDATE products SET is_deleted = 0;

-- 테스트용 확인
SELECT product_id, name, status FROM products ORDER BY product_id DESC LIMIT 10;
select * from products;

desc products;

DELETE p1
FROM products p1
JOIN products p2
  ON p1.name = p2.name
 AND p1.product_id > p2.product_id;
 
 START TRANSACTION;

-- 1) 각 name별로 남길 대표 product_id(최소값) 산출
CREATE TEMPORARY TABLE dedup_keep AS
SELECT name, MIN(product_id) AS keep_id
FROM products
GROUP BY name;

-- 2) 대표가 아닌 중복 product_id 목록 (삭제 대상) 생성
CREATE TEMPORARY TABLE dedup_dups AS
SELECT p.product_id AS dup_id, k.keep_id
FROM products p
JOIN dedup_keep k ON k.name = p.name
WHERE p.product_id <> k.keep_id;

-- 3) 자식 테이블의 FK를 모두 대표 keep_id로 치환
--    (지금 에러 난 테이블: order_product)
UPDATE order_product op
JOIN dedup_dups d ON op.product_id = d.dup_id
SET op.product_id = d.keep_id;

-- ❗ FK로 products를 참조하는 다른 테이블이 있으면 여기도 같은 방식으로 업데이트
-- 예) cart_items 같은 테이블이 products(product_id) FK라면:
-- UPDATE cart_items ci
-- JOIN dedup_dups d ON ci.product_id = d.dup_id
-- SET ci.product_id = d.keep_id;

-- 4) 이제 중복 제품(대표 제외) 삭제
DELETE p
FROM products p
JOIN dedup_dups d ON p.product_id = d.dup_id;

COMMIT;

DELETE FROM products
WHERE product_id > 24;

SELECT
  kcu.TABLE_NAME,
  kcu.COLUMN_NAME,
  kcu.CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE kcu
WHERE kcu.REFERENCED_TABLE_SCHEMA = DATABASE()
  AND kcu.REFERENCED_TABLE_NAME = 'products'
  AND kcu.REFERENCED_COLUMN_NAME = 'product_id';
  
  START TRANSACTION;
  DELETE FROM cart_item
  WHERE product_id > 24;
  
  delete from inquiry
  WHERE product_id > 24;
  
  delete from order_product
  WHERE product_id > 24;
  
  delete from restock_request_item
  WHERE product_id > 24;
  
  delete from reviews
  WHERE product_id > 24;

select * from products;

rollback
