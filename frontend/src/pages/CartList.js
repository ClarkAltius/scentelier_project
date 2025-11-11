import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Image, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import { useAuth } from "../component/AuthContext";
import axios from "axios";
import { X } from "lucide-react";
import "./CartList.css";

// 배송 정책
const SHIPPING_FEE = 0;
const FREE_SHIPPING_THRESHOLD = Infinity; // 무료배송 조건 미정

// 서버 데이터 정규화
const normalizeCartItem = (raw) => {
  const cart_item_id = raw.cart_item_id ?? raw.cartItemId ?? raw.id;
  const product_id = raw.product_id ?? raw.productId;
  const quantity = Number(raw.quantity ?? raw.qty ?? 1);
  const checked = Boolean(raw.checked ?? true);
  const product = raw.product ?? raw.productDto ?? {};
  const custom_id = raw.customId ?? raw.custom_id;

  return {
    cartItemId: cart_item_id,
    productId: product_id,
    customId: custom_id,
    name: product.name ?? raw.name ?? "상품명",
    price: Number(product.price ?? raw.price ?? 0),
    originalPrice: Number(product.original_price ?? raw.originalPrice ?? product.price ?? raw.price ?? 0),
    image: product.image_url ?? product.imageUrl ?? raw.image_url ?? raw.imageUrl ?? raw.image ?? null,
    quantity,
    checked,
  };
};

function CartList() {
  useEffect(() => {
    // 부드럽게 올리고 싶으면 behavior: 'smooth'
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const navigate = useNavigate();

  // 합계 갱신
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

  // 데이터 로드
  useEffect(() => {
    if (!user?.id) return;
    fetchCartItems();
  }, [user?.id]);


  const fetchCartItems = async () => {
    try {
      const url = `${API_BASE_URL}/cart/list/${user.id}`;
      const res = await axios.get(url, { withCredentials: true });

      // 받아온 데이터를 정규화해서 items에 반영
      const normalized = (res.data ?? []).map((x) =>
        normalizeCartItem({ checked: true, ...x })
      );
      updateItems(normalized);

    } catch (error) {
      console.log('오류 정보', error);
      // alert('카트 정보가 없어서 상품 목록으로 이동합니다.');
      updateItems([]);
      // navigate('/product/list');  상품목록으로 이동 네이게이터
    }
  };


  // 체크박스
  const toggleAll = (checked) => updateItems(items.map((p) => ({ ...p, checked }))); // 전체 선택,해제
  const toggleOne = (cartItemId) => // 개별 선택, 해제
    updateItems(items.map((p) => (p.cartItemId === cartItemId ? { ...p, checked: !p.checked } : p)));

  // 수량 증가
const inc = async (id) => {
  const target = items.find((p) => p.cartItemId === id);
  if (!target) return;

  const newQty = Number(target.quantity) + 1;
  await saveQuantity(id, newQty);
};

// 수량 감소
const dec = async (id) => {
  const target = items.find((p) => p.cartItemId === id);
  if (!target) return;

  const newQty = Math.max(1, Number(target.quantity) - 1);
  await saveQuantity(id, newQty);
};

// 직접 입력
const inputQty = async (id, v) => {
  const q = Math.max(1, Number(v) || 1);
  await saveQuantity(id, q);
};

// 서버 요청 및 반영
const saveQuantity = async (cartItemId, newQuantity) => {
  const target = items.find((p) => p.cartItemId === cartItemId);
  if (!target) return;

  try {
    const res = await axios.patch(
      `${API_BASE_URL}/cart/edit/${cartItemId}`,
      null,
      { params: { quantity: newQuantity }, withCredentials: true }
    );

    // 성공 시, 로컬 상태 반영
    updateItems(
      items.map((p) =>
        p.cartItemId === cartItemId ? { ...p, quantity: newQuantity } : p
      )
    );
  } catch (error) {
    console.error("수량 변경 오류:", error);

    // 서버에서 재고 부족 등의 메시지가 내려온 경우
    if (error.response?.data) {
      alert(error.response.data);
    } else {
      alert("수량 변경 중 문제가 발생했습니다.");
    }

    // 실패 시 원래 수량 유지 (updateItems 호출 안 함)
  }
};

  // const saveQuantity = async (cartItemId) => {
  //   const target = items.find((p) => p.cartItemId === cartItemId);
  //   if (!target) return;
  //   try {
  //     const url = `${API_BASE_URL}/cart/edit/${cartItemId}?quantity=${target.quantity}`;
  //     await axios.patch(url, {}, { withCredentials: true });
  //     alert("수량이 변경되었습니다.");
  //   } catch (e) {
  //     console.error(e);
  //     alert("수량 변경에 실패했습니다.");
  //   }
  // };

  // 삭제
  const removeOne = async (cartItemId) => {
    if (!window.confirm("해당 상품을 삭제하시겠습니까?")) return;
    try {
      const url = `${API_BASE_URL}/cart/delete/${cartItemId}`;
      await axios.delete(url, { withCredentials: true });
      updateItems(items.filter((p) => p.cartItemId !== cartItemId));
    } catch (error) {
      console.error(error);
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
        ids.map((id) =>
          axios.delete(`${API_BASE_URL}/cart/delete/${id}`, { withCredentials: true })
        )
      );
      updateItems(items.filter((p) => !p.checked));
      alert("선택한 상품이 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      alert("선택 삭제 중 오류가 발생했습니다.");
    }
  };

  const payable = selectedTotal + shipping;
  const allChecked = items.length > 0 && items.every((p) => p.checked);


  const goProducts = () => navigate("/product/list");
  const goFinder = () => navigate("/perfume/finder"); // 프로젝트 라우팅에 맞게 수정해도 됨

  const goToPayment = (selectedItems) => {
    if (!selectedItems.length) {
      alert("주문할 상품을 선택해 주세요.");
      return;
    }
    navigate("/payments", { state: { products: selectedItems } });
  };

  // -------------------------------------------------------------------
  return (
    <div>
      {/*상단 헤더*/}
      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "50px 0 40px 0",
          textAlign: "center",
          borderBottom: "1px solid #eee",
        }}
      >
        <h1
          style={{
            fontSize: "54px",
            fontFamily: "'Gowun Batang', serif",
            color: "#67AB9F",
          }}
        >
          My Bag
        </h1>
        <p
          style={{
            marginTop: "10px",
            color: "#888",
            fontSize: "18px",
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          당신의 향기를 담은 아이템들이 기다리고 있습니다.
        </p>

        {/* 상단  */}
        <div className="d-flex gap-2 justify-content-center mt-3">
          <Button
            size="sm"
            onClick={goProducts}
            style={{
              borderRadius: 10,
              minWidth: 140,
              fontWeight: 600,
              border: "2px solid #a5a5a5ff",
              color: "#a5a5a5ff",
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
          >
            상품 더 보러가기
          </Button>
        </div>
      </div>


      <Container className="mt-5" style={{ maxWidth: 900 }}>
        {items.length === 0 ? (
          <Alert variant="secondary" className="text-center">
            장바구니가 비어 있습니다.
          </Alert>
        ) : (
          <>
            {items.map((p) => {
              // 1. 이미지 URL 결정
              let imgSrc;
              if (p.image) {
                imgSrc = p.image.startsWith("http")
                  ? p.image
                  : `${API_BASE_URL}/uploads/products/${p.image}`;
              } else {
                imgSrc = `${API_BASE_URL}/uploads/def.jpg`; // 디폴트 이미지 경로
              }
              const discount = p.originalPrice > p.price ? p.originalPrice - p.price : 0;
              const lineTotal = Number(p.price) * Number(p.quantity);

              return (
                <div
                  key={p.cartItemId}
                  className="pb-4 mb-4"
                  style={{ borderBottom: "1px solid #e9e9e9" }}
                >
                  <Row className="g-3">
                    <Col xs="auto" className="d-flex align-items-center">
                      <Form.Check
                        type="checkbox"
                        checked={p.checked}
                        onChange={() => toggleOne(p.cartItemId)}
                        className="custom-checkbox"
                      />
                    </Col>
                    <Col xs={3} md={2}>
                      <Image src={imgSrc} alt={p.name} thumbnail />
                    </Col>

                    <Col>
                      <div
                        className="d-flex justify-content-between align-items-start"
                        style={{ marginLeft: "10px" }}
                      >
                        {/* 왼쪽 상품 정보 */}
                        <div className="flex-grow-1">
                          {/* 상품명 */}
                          <div style={{ fontWeight: 600, marginBottom: "8px", fontSize: "17px" }}>{p.name}</div>

                          {/* 가격 정보 묶음 */}
                          <div style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
                            {/* 정상가 */}
                            <div className="d-flex justify-content-between text-muted">
                              <span>정상가</span>
                              <span>{p.originalPrice.toLocaleString()}원</span>
                            </div>

                            {/* 할인가 */}
                            {discount > 0 && (
                              <div className="d-flex justify-content-between text-danger fw-semibold">
                                <span>할인가</span>
                                <span>-{discount.toLocaleString()}원</span>
                              </div>
                            )}

                            <hr className="my-2" style={{ opacity: 0.3 }} />

                            {/* 상품금액 */}
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-semibold">상품금액</span>
                              <span style={{ color: "#67AB9F", fontSize: "18px" }}>
                                <strong>{lineTotal.toLocaleString()}원</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 오른쪽 X 버튼 */}
                        <Button
                          variant="link"
                          className="text-muted ms-2"
                          onClick={() => removeOne(p.cartItemId)}
                          title="삭제"
                        >
                          <X />
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
                          onBlur={() => saveQuantity(p.cartItemId)}
                          style={{ width: 80, textAlign: "center" }}
                        />
                        <Button variant="light" onClick={() => { inc(p.cartItemId); saveQuantity(p.cartItemId); }}>
                          +
                        </Button>
                        {/** 
                        <Button
                          variant="outline-dark"
                          className="ms-3"
                          onClick={() => saveQuantity(p.cartItemId)}
                        >
                          변경
                        </Button>
                        */}
                      </div>
                    </Col>
                  </Row>
                </div>
              );
            })}

            {/* 전체선택 / 선택삭제 */}
            <div className="d-flex justify-content-between flex-wrap gap-2 my-3">
              <div className="d-flex gap-2">
                <Button variant="outline-dark" onClick={() => toggleAll(!allChecked)}
                  style={{
                    border: "2px solid #a5a5a5ff", // ✅ 원하는 색상 테두리
                    color: "#808080ff",             // ✅ 글자색도 동일하게
                    backgroundColor: "transparent", // ✅ 배경 투명
                    boxShadow: "none",              // ✅ 클릭 시 그림자 제거
                  }}>
                  전체선택
                </Button>
                <Button variant="outline-dark" onClick={removeSelected}
                  style={{
                    border: "2px solid #a5a5a5ff", // ✅ 원하는 색상 테두리
                    color: "#808080ff",             // ✅ 글자색도 동일하게
                    backgroundColor: "transparent", // ✅ 배경 투명
                    boxShadow: "none",              // ✅ 클릭 시 그림자 제거
                  }}>
                  선택삭제
                </Button>
              </div>
            </div>

            {/* 합계 영역 */}
            <div className="border p-3 my-4 shadow-sm rounded">
              <Row>
                <Col>총 상품금액</Col>
                <Col className="text-end">{selectedTotal.toLocaleString()}원</Col>
              </Row>
              <Row>
                <Col>배송비</Col>
                <Col className="text-end">무료</Col>
              </Row>
              <hr />
              <Row>
                <Col>
                  <strong>결제예정금액</strong>
                </Col>
                <Col className="text-end" style={{ fontSize: "20px" }}>
                  <strong>{payable.toLocaleString()}원</strong>
                </Col>
              </Row>
            </div>

            {/* 주문 버튼 */}
            <div className="d-grid gap-3">
              <Button
                size="lg"
                style={{
                  borderRadius: "10", fontWeight: "600",
                  border: "2px solid #67AB9F", // ✅ 원하는 색상 테두리
                  color: "white",             // ✅ 글자색도 동일하게
                  backgroundColor: "#67AB9F", // ✅ 배경 투명
                  boxShadow: "none",              // ✅ 클릭 시 그림자 제거
                }}
                onClick={() => goToPayment(items)}
              >
                전체상품주문
              </Button>
              <Button
                variant="outline-dark"
                size="lg"
                style={{
                  borderRadius: "10", fontWeight: "600",
                  border: "2px solid #a5a5a5ff", // ✅ 원하는 색상 테두리
                  color: "#808080ff",             // ✅ 글자색도 동일하게
                  backgroundColor: "transparent", // ✅ 배경 투명
                  boxShadow: "none",              // ✅ 클릭 시 그림자 제거
                }}
                onClick={() => goToPayment(items.filter((p) => p.checked))}
              >
                선택상품주문
              </Button>
            </div>
          </>
        )}
      </Container>

      {/* 추천/테스트 */}
      <div
        style={{
          marginTop: "80px",
          padding: "60px 0",
          backgroundColor: "#f7f9f8",
          borderTop: "1px solid #eaeaea",
          borderBottom: "1px solid #eaeaea",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontFamily: "'Gowun Batang', serif",
            color: "#67AB9F",
            marginBottom: "14px",
          }}
        >
          당신의 이야기를 더 풍성하게
        </h3>
        <p style={{ color: "#777", marginBottom: 24 }}>
          Scentelier가 추천하는 향을 만나보거나, 몇 가지 질문으로 나만의 향을 찾아보세요.
        </p>

        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Button
            variant="outline-success"
            size="lg"
            style={{
              minWidth: 220, borderRadius: 10, fontWeight: 600,
              border: "2px solid #a5a5a5ff", // ✅ 원하는 색상 테두리
              color: "#a5a5a5ff",             // ✅ 글자색도 동일하게
              backgroundColor: "transparent", // ✅ 배경 투명
              boxShadow: "none",              // ✅ 클릭 시 그림자 제거
            }}
            onClick={goProducts}
          >
            추천 향수 보러가기
          </Button>
          <Button
            variant="outline-dark"
            size="lg"
            style={{
              minWidth: 220, borderRadius: 10, fontWeight: 600,
              border: "2px solid #a5a5a5ff", // ✅ 원하는 색상 테두리
              color: "#a5a5a5ff",             // ✅ 글자색도 동일하게
              backgroundColor: "transparent", // ✅ 배경 투명
              boxShadow: "none",              // ✅ 클릭 시 그림자 제거
            }}
            onClick={goFinder}
          >
            나만의 향 찾기 테스트
          </Button>
        </div>
      </div>

      {/* 하단섹션 */}
      <div
        style={{
          textAlign: "center",
          padding: "64px 0 80px",
          backgroundColor: "#fafafa",
          borderTop: "1px solid #eee",
        }}
      >
        <h3
          style={{
            fontFamily: "'Gowun Batang', serif",
            color: "#67AB9F",
            marginBottom: "15px",
          }}
        >
          "Your scent tells your story."
        </h3>
        <p
          style={{
            color: "#999",
            fontSize: "18px",
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          Scentelier는 향기로 기억되는 순간을 선물합니다.
          <br />
          주문을 완료하면 당신만의 향기가 시작됩니다.
        </p>
      </div>

      {/* 모바일 스티키 결제바 */}
      <div
        className="d-md-none"
        style={{
          position: "sticky",
          bottom: 0,
          background: "#ffffffcc",
          backdropFilter: "saturate(120%) blur(6px)",
          borderTop: "1px solid #eee",
          padding: "12px 16px",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div style={{ fontSize: 14, color: "#666" }}>결제예정금액</div>
          <div style={{ fontWeight: 700 }}>{payable.toLocaleString()}원</div>
        </div>
        <div className="d-grid">
          <Button
            variant="success"
            size="lg"
            style={{ borderRadius: 8, fontWeight: 700 }}
            onClick={() => goToPayment(items.filter((p) => p.checked))}
          >
            선택상품주문
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CartList;