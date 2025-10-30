import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, Wallet, Banknote, Truck, Package } from "lucide-react";
import { API_BASE_URL } from "../config/config";
import axios from "axios";
import { useAuth } from "../component/AuthContext";

function Payments(props) {
    const location = useLocation();
    const navigate = useNavigate();

    const products = location.state?.products || [];
    const { user } = useAuth();

    const [method, setMethod] = useState("Card");
    const [showModal, setShowModal] = useState(false);
    const [delivery, setDelivery] = useState({
        recipientName: '',
        phone: '',
        address: '',
        detail: '',
    });

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!location.state?.products?.length) {
            alert("선택한 상품이 없습니다. 장바구니로 이동합니다.");
            navigate("/cart");
            return;
        }
        setDelivery({
            recipientName: user.username,
            phone: user.phone,
            address: user.address,
            detail: ''
        });
    }, [user, location.state]);


    const totalPrice = products.reduce((sum, item) => 
        sum + item.price * (item.quantity || 1), 0);

    const paymentMethods = [
        { id: "CARD", name: "신용/체크카드", icon: <CreditCard size={28} /> },
        { id: "KAKAO_PAY", name: "카카오페이", icon: <Wallet size={28} /> },
        { id: "NAVER_PAY", name: "네이버페이", icon: <Wallet size={28} /> },
        { id: "CASH", name: "계좌이체", icon: <Banknote size={28} /> },
    ];

    const handleChange = (e) => {
        setDelivery({ ...delivery, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!delivery.recipientName || !delivery.phone || !delivery.address) {
            alert("배송지 정보를 모두 입력해주세요.");
            return;
        }
        const url = `${API_BASE_URL}/order`;
        const orderData = {
            userId: user.id,
            recipientName: delivery.recipientName,
            phone: delivery.phone,
            address: delivery.address+'/'+delivery.detail,
            totalPrice: totalPrice,
            status: 'PAID',
            paymentMethod: method,
            orderProducts: [
                ...products
                    .filter((product) => product.productId)
                    .map((p) => ({
                    cartItemId: p.cartItemId,
                    productId: p.productId,
                    customId: null,
                    quantity: p.quantity,
                    price: p.price,
                })),
                ...products
                    .filter((product) => product.customId)
                    .map((c) => ({
                    cartItemId: c.cartItemId,
                    productId: null,
                    customId: c.customId,
                    quantity: c.quantity,
                    price: c.price,
                })),
            ],
        };
        try {
            await axios.post(url, orderData);
            setShowModal(true);
        } catch (err) {
            console.error(err);
            alert("결제 요청 중 오류가 발생했습니다.");
        }
    };

    return (
        <Container className="py-5 p-4" style={{ backgroundColor: "#f1f3f6", height:"93vh" }}>
            <Row className="g-4">
                {/* 배송 정보 */}
                <Col md={12}>
                    <Card className="shadow border-0 p-3 rounded-4">
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
                                            value={delivery.recipientName}
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
                    <Card className="shadow border-0 p-3 rounded-4">
                        <Card.Header className="bg-white border-bottom fw-bold fs-5 d-flex align-items-center">
                            <Package className="me-2 text-primary" /> 주문 요약
                        </Card.Header>
                        <Card.Body>
                            <h5>일반 상품</h5>
                            {products.filter((product) => !!product.productId).map((p, idx) => (
                                <div key={idx} className="d-flex justify-content-between mb-2">
                                    <span key={`p-${p.cartItemId}`}>
                                    {p.name} — {p.quantity}개
                                    </span>
                                    <span>
                                        ₩{(p.price*p.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            <h5 className="mt-3">커스텀 향수</h5>
                            {products.filter((product) => !!product.customId).map((c, idx) => (
                                <div key={idx} className="d-flex justify-content-between mb-2">
                                    <span key={`c-${c.cartItemId}`}>
                                    {c.name} — {c.quantity}개
                                    </span>
                                    <span>
                                        ₩{(c.price*c.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>총 결제 금액</span>
                                <span className="text-success">₩{totalPrice.toLocaleString()}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 결제 방식 */}
                <Col md={6}>
                    <Card className="shadow border-0 p-3 rounded-4">
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
                        <p><strong>수취인:</strong> {delivery.recipientName}</p>
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
