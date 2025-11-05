import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Row, Col, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import { User, Truck, Info, Calendar, DollarSign, Mail, Phone, MapPin } from 'lucide-react';
// We no longer need to import the parent's CSS for status badges
// import styles from './OrderManagement.module.css'; 

/**
 * A helper function to render a Bootstrap Badge based on order status.
 */
const getStatusBadge = (status) => {
    let variant;
    switch (status) {
        case 'PENDING':
            variant = 'warning';
            break;
        case 'PAID':
            variant = 'info';
            break;
        case 'SHIPPED':
            variant = 'primary';
            break;
        case 'DELIVERED':
            variant = 'success';
            break;
        case 'CANCELLED':
            variant = 'danger';
            break;
        default:
            variant = 'secondary';
    }
    return <Badge bg={variant}>{status}</Badge>;
};

/**
 * A helper component to render the custom ingredients list.
 */
const CustomIngredients = ({ ingredients }) => {
    if (!ingredients || ingredients.length === 0) {
        return <small className="text-muted">No custom ingredients.</small>;
    }

    return (
        <div style={{ fontSize: '0.85em', paddingLeft: '10px' }}>
            <strong className="text-muted">원액 구성:</strong>
            <ul style={{ paddingLeft: '20px', marginBottom: '0' }}>
                {ingredients.map((ing, index) => (
                    <li key={index}>
                        {ing.ingredientName}: {ing.amount}
                    </li>
                ))}
            </ul>
        </div>
    );
};


function OrderDetailsModal({ order, show, handleClose, onCancelOrder }) {

    // 스테이트 정의
    const [orderDetails, setOrderDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 모달 전용 훅. show 나 order 변경시 사용
    useEffect(() => {
        if (show && order?.id) {
            const fetchOrderDetails = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/api/admin/orders/${order.id}`,
                        { withCredentials: true }
                    );
                    setOrderDetails(response.data);
                    // console.log(response.data);
                } catch (err) {
                    console.error("Failed to fetch order details:", err);
                    setError("주문 상세 정보를 불러오는 데 실패했습니다.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrderDetails();

        } else if (!show) {
            // 모달창 닫을 때 정보 초기화
            setOrderDetails(null);
            setError(null);
            setIsLoading(false);
        }
    }, [order, show]);

    // === Event Handlers ===
    const handleCancelClick = async () => {
        if (order && onCancelOrder) {
            await onCancelOrder(order.id);
            handleClose();
        }
    };

    // === Render Logic ===
    const renderModalContent = () => {
        if (isLoading) {
            return <div className="text-center p-5"><Spinner animation="border" /> <p>상세 정보를 불러오는 중...</p></div>;
        }

        if (error) {
            return <Alert variant="danger">{error}</Alert>;
        }

        // 로딩이 다 되었는데 정보가 없으면
        if (!orderDetails) {
            return null; // 표기 x
        }

        // Helper function for optional fields
        const InfoRow = ({ icon, label, value }) => (
            value ? <p className="mb-1"><strong className="d-inline-flex align-items-center">{icon} {label}:</strong> {value}</p> : null
        );

        // 성공적으로 주문 정보를 불러오면 렌더링
        return (
            <Container fluid>
                <Row className="mb-3 g-3">
                    {/* Box 1: Customer Info */}
                    <Col md={4}>
                        <div className="p-3 border rounded h-100">
                            <h5 className="d-flex align-items-center"><User size={20} className="me-2" />고객 정보</h5>
                            <hr className="mt-1" />
                            {InfoRow({ icon: <User size={16} className="me-1" />, label: "수령인", value: orderDetails.recipientName })}
                            {InfoRow({ icon: <Mail size={16} className="me-1" />, label: "이메일", value: orderDetails.customerEmail })}
                            {InfoRow({ icon: <Phone size={16} className="me-1" />, label: "연락처", value: orderDetails.customerPhone })}
                        </div>
                    </Col>

                    {/* Box 2: Shipping Info */}
                    <Col md={4}>
                        <div className="p-3 border rounded h-100">
                            <h5 className="d-flex align-items-center"><Truck size={20} className="me-2" />배송 정보</h5>
                            <hr className="mt-1" />
                            {InfoRow({ icon: <MapPin size={16} className="me-1" />, label: "주소", value: orderDetails.address })}
                            {InfoRow({ icon: <Truck size={16} className="me-1" />, label: "송장번호", value: orderDetails.trackingNumber })}
                        </div>
                    </Col>

                    {/* Box 3: Order Summary */}
                    <Col md={4}>
                        <div className="p-3 border rounded h-100" style={{ backgroundColor: '#f8f9fa' }}>
                            <h5 className="d-flex align-items-center"><Info size={20} className="me-2" />주문 요약</h5>
                            <hr className="mt-1" />
                            {InfoRow({ icon: <Calendar size={16} className="me-1" />, label: "주문 날짜", value: new Date(orderDetails.orderDate).toLocaleString() })}
                            {InfoRow({ icon: <DollarSign size={16} className="me-1" />, label: "총액", value: `₩${orderDetails.totalPrice?.toLocaleString()}` })}
                            <div className="d-flex align-items-center">
                                <strong className="me-2">상태:</strong> {getStatusBadge(orderDetails.status)}
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className="p-3 border rounded mt-3">
                    <h4>주문 항목</h4>
                    <Table striped="true" bordered hover responsive="sm" size="sm" className="mt-3">
                        <thead>
                            <tr>
                                <th>상품명</th>
                                <th>상세</th>
                                <th>개당 가격</th>
                                <th>수량</th>
                                <th>합계</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(orderDetails.orderItems || []).map((item) => (
                                <tr key={item.productId || Math.random()}>
                                    <td>
                                        {item.productName}
                                        {item.type === 'CUSTOM' && <Badge bg="secondary" className="ms-2">Custom</Badge>}
                                    </td>
                                    <td>
                                        {item.type === 'CUSTOM' ?
                                            <CustomIngredients ingredients={item.ingredients} /> :
                                            <small className="text-muted">완제품</small>
                                        }
                                    </td>
                                    <td>₩{item.price?.toLocaleString()}</td>
                                    <td>{item.quantity}</td>
                                    <td>₩{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Container>
        );
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>주문 상세 정보 (#{order?.id})</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {renderModalContent()}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    닫기
                </Button>
                {orderDetails && orderDetails.status !== 'CANCELLED' && orderDetails.status !== 'DELIVERED' && (
                    <Button variant="danger" onClick={handleCancelClick}>
                        주문 취소
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export default OrderDetailsModal;