import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Image, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import axios from "axios";

// 배송 정책 (필요 시 조정)
const SHIPPING_FEE = 3000;
const FREE_SHIPPING_THRESHOLD = Infinity; // 배송비 무료 주문금액 미정

/* 서버 아이템 뷰모델로 변환 */
const normalizeCartItem = (raw) => {
  // ERD 기본 키
  const cart_item_id = raw.cart_item_id ?? raw.cartItemId ?? raw.id;
  const cart_id = raw.cart_id ?? raw.cartId;
  const product_id = raw.product_id ?? raw.productId;

  // 수량/체크
  const quantity = Number(raw.quantity ?? raw.qty ?? 1);
  const checked = Boolean(raw.checked ?? true);

  // 상품 정보가 조인되어 오는 경우/안 오는 경우 모두 커버
  const product = raw.product ?? raw.productDto ?? {};
  const name =
    product.name ??
    raw.product_name ??
    raw.name ??
    "상품명";
  const price = Number(
    product.price ??
      raw.price ??
      raw.unit_price ??
      0
  );
  const originalPrice = Number(
    product.original_price ??
      raw.originalPrice ??
      raw.list_price ??
      price
  );
  const image =
    product.image_url ??
    product.imageUrl ??
    raw.image_url ??
    raw.image;

  return {
    cartItemId: cart_item_id,  // 프런트 표준: 카멜케이스
    cartId: cart_id,
    productId: product_id,
    name,
    price,
    originalPrice,
    image,       // 백엔드가 파일명만 주면 아래에서 API_BASE_URL 붙여서 쓸 예정
    quantity,
    checked,
  };
};
/** --------------------------------------------- */

function CartList({ user }) {
  const [items, setItems] = useState([]);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const navigate = useNavigate();

  const refreshTotals = (list) => {
    const total = (list ?? [])
      .filter((p) => p.checked)
      .reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);

    setSelectedTotal(total);
    if (total === 0) setShipping(0);
    else if (total >= FREE_SHIPPING_THRESHOLD) setShipping(0);
    else setShipping(SHIPPING_FEE);
  };

  const updateItems = (next) => {
    setItems(next);
    refreshTotals(next);
  };

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        // ERD 기준: cart_item은 cart(member_id)와 연결.
        // 기존 API를 유지하되, 응답을 normalize 해서 사용.
        const url = `${API_BASE_URL}/cart/list/${user.id}`;
        const res = await axios.get(url, { withCredentials: true });

        const normalized = (res.data ?? []).map((x) =>
          normalizeCartItem({ checked: true, ...x })
        );
        updateItems(normalized);
      } catch (e) {
        console.error(e);
        alert("'카트 상품' 정보가 존재하지 않아서 상품 목록으로 이동합니다.");
        navigate("/product/list");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 체크박스
  const toggleAll = (checked) => updateItems(items.map((p) => ({ ...p, checked })));
  const toggleOne = (cartItemId) =>
    updateItems(
      items.map((p) => (p.cartItemId === cartItemId ? { ...p, checked: !p.checked } : p))
    );

  // 수량
  const inc = (id) =>
    updateItems(
      items.map((p) => (p.cartItemId === id ? { ...p, quantity: Number(p.quantity) + 1 } : p))
    );
  const dec = (id) =>
    updateItems(
      items.map((p) =>
        p.cartItemId === id ? { ...p, quantity: Math.max(1, Number(p.quantity) - 1) } : p
      )
    );
  const inputQty = (id, v) => {
    const q = Math.max(1, Number(v) || 1);
    updateItems(items.map((p) => (p.cartItemId === id ? { ...p, quantity: q } : p)));
  };

  // 서버 반영 (ERD: cart_item_id 기준 PATCH)
  const saveQuantity = async (cartItemId) => {
    const target = items.find((p) => p.cartItemId === cartItemId);
    if (!target) return;
    try {
      const url = `${API_BASE_URL}/cart/edit/${cartItemId}?quantity=${target.quantity}`;
      await axios.patch(url, {}, { withCredentials: true });
      alert("수량이 변경되었습니다.");
    } catch (e) {
      console.error(e);
      alert("수량 변경에 실패했습니다.");
    }
  };

  // 삭제 (ERD: cart_item_id 기준 DELETE)
  const removeOne = async (cartItemId) => {
    if (!window.confirm("해당 상품을 삭제하시겠습니까?")) return;
    try {
      const url = `${API_BASE_URL}/cart/delete/${cartItemId}`;
      await axios.delete(url, { withCredentials: true });
      updateItems(items.filter((p) => p.cartItemId !== cartItemId));
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 선택 삭제
  const removeSelected = async () => {
    const ids = items.filter((p) => p.checked).map((p) => p.cartItemId);
    if (ids.length === 0) {
      alert("삭제할 상품을 선택해 주세요.");
      return;
    }
    if (!window.confirm("선택한 상품을 삭제하시겠습니까?")) return;

    try {
      await Promise.all(
        ids.map((id) => axios.delete(`${API_BASE_URL}/cart/delete/${id}`, { withCredentials: true }))
      );
      updateItems(items.filter((p) => !p.checked));
      alert("선택한 상품이 삭제되었습니다.");
    } catch (e) {
      console.error(e);
      alert("선택 삭제 중 오류가 발생했습니다.");
    }
  };

  // 주문 (ERD: orders + order_product)
  const order = async (targets) => {
    if (targets.length === 0) {
      alert("주문할 상품을 선택해 주세요.");
      return;
    }
    try {
      const url = `${API_BASE_URL}/order`;
      const body = {
        memberId: user.id,               // ERD: orders.member_id
        status: "PENDING",               // ERD: orders.order_status
        orderItems: targets.map((p) => ({
          cartItemId: p.cartItemId,      // 백엔드에서 장바구니 소거용
          productId: p.productId,        // ERD: order_product.product_id
          quantity: p.quantity,          // ERD: order_product.quantity
        })),
      };
      const res = await axios.post(url, body, { withCredentials: true });
      alert(res.data ?? "주문이 완료되었습니다.");

      const removeIds = new Set(targets.map((p) => p.cartItemId));
      updateItems(items.filter((p) => !removeIds.has(p.cartItemId)));
    } catch (e) {
      console.error(e);
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  };

  const orderAll = () => order(items);
  const orderSelected = () => order(items.filter((p) => p.checked));

  const payable = selectedTotal + shipping;
  const allChecked = items.length > 0 && items.every((p) => p.checked);

  return (
    <Container className="mt-4" style={{ maxWidth: 900 }}>
      <h2 className="text-center mb-4">BAG</h2>

      {items.length === 0 ? (
        <Alert variant="secondary">장바구니가 비어 있습니다.</Alert>
      ) : (
        <>
          {items.map((p) => {
            const imgSrc = p.image?.startsWith("http")
              ? p.image
              : `${API_BASE_URL}/images/${p.image ?? ""}`;
            const discount = p.originalPrice > p.price ? p.originalPrice - p.price : 0;
            const lineTotal = Number(p.price) * Number(p.quantity);

            return (
              <div key={p.cartItemId} className="pb-4 mb-4" style={{ borderBottom: "1px solid #e9e9e9" }}>
                <Row className="g-3">
                  <Col xs="auto" className="d-flex align-items-start">
                    <Form.Check
                      type="checkbox"
                      checked={p.checked}
                      onChange={() => toggleOne(p.cartItemId)}
                      className="mt-2"
                    />
                  </Col>

                  <Col xs={3} md={2}>
                    <Image src={imgSrc} alt={p.name} thumbnail />
                  </Col>

                  <Col>
                    <div className="d-flex justify-content-between">
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="mt-2 small">
                          정상가 : {p.originalPrice.toLocaleString()}원
                          <br />
                          할인가 : {discount > 0 ? `- ${discount.toLocaleString()}원` : "없음"}
                          <br />
                          상품구매금액 : <strong>{lineTotal.toLocaleString()}원</strong>
                        </div>
                      </div>

                      <Button
                        variant="link"
                        className="text-muted"
                        onClick={() => removeOne(p.cartItemId)}
                        title="삭제"
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="d-flex align-items-center gap-2 mt-3">
                      <Button variant="light" onClick={() => dec(p.cartItemId)}>
                        −
                      </Button>
                      <Form.Control
                        type="number"
                        min={1}
                        value={p.quantity}
                        onChange={(e) => inputQty(p.cartItemId, e.target.value)}
                        style={{ width: 80, textAlign: "center" }}
                      />
                      <Button variant="light" onClick={() => inc(p.cartItemId)}>
                        +
                      </Button>

                      <Button variant="outline-dark" className="ms-3" onClick={() => saveQuantity(p.cartItemId)}>
                        변경
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            );
          })}

          {/* 전체선택 / 선택삭제 */}
          <div className="d-flex justify-content-between flex-wrap gap-2 my-3">
            <div className="d-flex gap-2">
              <Button variant="outline-dark" onClick={() => toggleAll(!allChecked)}>
                전체선택
              </Button>
              <Button variant="outline-dark" onClick={removeSelected}>
                선택삭제
              </Button>
            </div>
          </div>

          {/* 합계 */}
          <div className="border p-3 my-4">
            <Row>
              <Col>총 상품금액</Col>
              <Col className="text-end">{selectedTotal.toLocaleString()}원</Col>
            </Row>
            <Row>
              <Col>총 배송비</Col>
              <Col className="text-end">{shipping.toLocaleString()}원</Col>
            </Row>
            <hr />
            <Row>
              <Col>
                <strong>결제예정금액</strong>
              </Col>
              <Col className="text-end">
                <strong>{payable.toLocaleString()}원</strong>
              </Col>
            </Row>
          </div>

          {/* 주문 버튼 */}
          <div className="d-grid gap-3">
            <Button variant="light" onClick={orderAll}>
              전체상품주문
            </Button>
            <Button variant="light" onClick={orderSelected}>
              선택상품주문
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default CartList;
