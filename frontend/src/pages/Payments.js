import { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Payments(props) {
    const [method, setMethod] = useState("card");
    const [showModal, setShowModal] = useState(false);
    const [delivery, setDelivery] = useState({
        receiver: "",
        phone: "",
        address: "",
        detail: "",
    });

    const navigate = useNavigate();

    const totalPrice = 62000; // 예시 금액

    const paymentMethods = [
        { id: "Card", name: "신용/체크카드" },
        { id: "KakaoPay", name: "카카오페이" },
        { id: "NaverPay", name: "네이버페이"},
        { id: "Bank", name: "계좌이체" },
    ];

    const handleChange = (e) => {
        setDelivery({ ...delivery, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!delivery.receiver || !delivery.phone || !delivery.address) {
            alert("배송지 정보를 모두 입력해주세요.");
            return;
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        // 결제 완료 후 리다이렉트 또는 초기화
        navigate("/");
    };

    return (
        <Container className="py-5">
            <Row className="g-4">
                {/* 배송 정보 */}
                <Col md={12}>
                    <Card className="shadow-sm border-0" bg="light">
                        <Card.Header className="bg-secondary text-light fw-bold fs-5">
                        배송지 정보
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label>수취인 이름</Form.Label>
                                    <Form.Control
                                    type="text"
                                    name="receiver"
                                    placeholder="홍길동"
                                    value={delivery.receiver}
                                    onChange={handleChange}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>연락처</Form.Label>
                                    <Form.Control
                                    type="text"
                                    name="phone"
                                    placeholder="010-1234-5678"
                                    value={delivery.phone}
                                    onChange={handleChange}
                                    />
                                </Col>
                                </Row>
                                <Row className="mb-3">
                                <Col md={8}>
                                    <Form.Label>주소</Form.Label>
                                    <Form.Control
                                    type="text"
                                    name="address"
                                    placeholder="서울특별시 강남구 테헤란로 123"
                                    value={delivery.address}
                                    onChange={handleChange}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Label>상세주소</Form.Label>
                                    <Form.Control
                                    type="text"
                                    name="detail"
                                    placeholder="101동 203호"
                                    value={delivery.detail}
                                    onChange={handleChange}
                                    />
                                </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    {/* 주문 요약 */}
                    <Card className="shadow-sm border-0"  bg="light">
                        <Card.Header className="bg-secondary text-light fw-bold fs-5">
                        주문 요약
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <span>커스텀 향수 “Midnight Blossom”</span>
                                <span>₩59,000</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                <span>배송비</span>
                                <span>₩3,000</span>
                            </div>
                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>총 결제 금액</span>
                                <span className="text-success">₩62,000</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 결제 방식 */}
                <Col md={6}>
                    <Card className="shadow-sm border-0"  bg="light">
                        <Card.Header className="bg-secondary text-light fw-bold fs-5">
                        결제 방식 선택
                        </Card.Header>
                        <Card.Body>
                        <Form>
                            {paymentMethods.map((m, idx) => (
                                <label key={idx} className={`mb-3 p-2 rounded ${
                                        method === m.id
                                            ? "bg-success text-light border"
                                            : "border"
                                        }`}>
                                    <Form.Check
                                        key={m.id}
                                        type="radio"
                                        id={m.id}
                                        name="payment"
                                        checked={method === m.id}
                                        onChange={() => setMethod(m.id)}
                                        style={{display: "none"}}
                                    />
                                {m.name}
                                </label>
                            ))}
                        </Form>

                        <Button
                            variant="success"
                            className="w-100 mt-4 py-2 fw-semibold"
                            onClick={handleSubmit}
                        >
                            결제하기
                        </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 결제 정보 확인 모달 */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>결제 완료</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5 className="fw-bold mb-3">결제 정보</h5>
                    <p>
                        <strong>수취인:</strong> {delivery.receiver}
                    </p>
                    <p>
                        <strong>연락처:</strong> {delivery.phone}
                    </p>
                    <p>
                        <strong>배송지:</strong> {delivery.address} {delivery.detail}
                    </p>
                    <p>
                        <strong>결제 방식:</strong>{" "}
                        {paymentMethods.find((m) => m.id === method)?.name}
                    </p>
                    <hr />
                    <p className="fw-bold fs-5 text-center">
                        총 결제 금액:{" "}
                        <span className="text-success">
                        ₩{totalPrice.toLocaleString()}
                        </span>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="success" onClick={() => navigate("/")}>
                    홈으로
                </Button>
                <Button
                    variant="warning"
                    onClick={() => navigate("/order/list")}
                >
                    주문내역
                </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Payments;
