import { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CreditCard, Wallet, Banknote, Truck, Package } from "lucide-react";

function Payments() {
    const [method, setMethod] = useState("Card");
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
        { id: "Card", name: "신용/체크카드", icon: <CreditCard size={28} /> },
        { id: "KakaoPay", name: "카카오페이", icon: <Wallet size={28} /> },
        { id: "NaverPay", name: "네이버페이", icon: <Wallet size={28} /> },
        { id: "Bank", name: "계좌이체", icon: <Banknote size={28} /> },
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

    return (
        <Container className="py-5">
            <Row className="g-4">
                {/* 배송 정보 */}
                <Col md={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom fw-bold fs-5 d-flex align-items-center">
                            <Truck className="me-2 text-success" /> 배송지 정보
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
                                <Row>
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

                {/* 주문 요약 */}
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom fw-bold fs-5 d-flex align-items-center">
                            <Package className="me-2 text-primary" /> 주문 요약
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
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom fw-bold fs-5 d-flex align-items-center">
                            <CreditCard className="me-2 text-warning" /> 결제 방식 선택
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-wrap justify-content-between">
                                {paymentMethods.map((m) => (
                                <div
                                    key={m.id}
                                    className={`text-center border rounded-3 p-3 mb-2 flex-grow-1 mx-1 payment-card ${
                                    method === m.id ? "bg-success text-white border-success" : ""
                                    }`}
                                    style={{
                                    cursor: "pointer",
                                    transition: "transform 0.2s",
                                    }}
                                    onClick={() => setMethod(m.id)}
                                >
                                    <div>{m.icon}</div>
                                    <div className="mt-2 fw-semibold">{m.name}</div>
                                </div>
                                ))}
                            </div>

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

            {/* 결제 완료 모달 */}
            <Modal 
                show={showModal} 
                centered
                backdrop="static"     // 바깥 클릭 막기
                keyboard={false}      // ESC 키 막기
            >
                <Modal.Header className="bg-success text-white">
                    <Modal.Title>결제 완료</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5 className="fw-bold mb-3 text-center">결제가 성공적으로 완료되었습니다!</h5>
                    <div className="border rounded-3 p-3 bg-light">
                        <p><strong>수취인:</strong> {delivery.receiver}</p>
                        <p><strong>연락처:</strong> {delivery.phone}</p>
                        <p><strong>배송지:</strong> {delivery.address} {delivery.detail}</p>
                        <p><strong>결제 방식:</strong> {paymentMethods.find((m) => m.id === method)?.name}</p>
                    </div>
                    <hr />
                    <p className="fw-bold fs-5 text-center mb-0">
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
                    <Button variant="outline-success" onClick={() => navigate("/order/list")}>
                        주문내역 보기
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Payments;
