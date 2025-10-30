import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
// css 스타일 재활용
import styles from './OrderManagement.module.css';

function OrderDetailsModal({ order, show, handleClose }) {

    // 스테이트 정의
    // 주문 전체 정보 담을 스테이트
    const [orderDetails, setOrderDetails] = useState(null);
    // 로딩 & 에러
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
                    console.log("커스텀향수 디버깅 : " + response.data);
                    console.log("커스텀 향수 오브젝트 반환값 뭐냐 : " + orderDetails);
                    console.log("FETCHED ORDER DETAILS:", JSON.stringify(response.data, null, 2))
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

    // 모달 바디 렌더링
    const renderModalContent = () => {
        if (isLoading) {
            return <p>상세 정보를 불러오는 중...</p>;
        }

        if (error) {
            return <p className="text-danger">{error}</p>;
        }

        // 로딩이 다 되었는데 정보가 없으면
        if (!orderDetails) {
            return null; // 표기 x
        }


        // 성공적으로 주문 정보를 불러오면 렌더링
        return (
            <>
                <p><strong>고객명:</strong> {orderDetails.recipientName}</p>
                <p><strong>주문 날짜:</strong> {new Date(orderDetails.orderDate).toLocaleString()}</p>
                <p><strong>총액:</strong> ₩{orderDetails.totalPrice?.toLocaleString()}</p>
                <p>
                    <strong>상태: </strong>
                    <span className={`${styles.statusBadge} ${styles[`status${orderDetails.status}`]}`}>
                        {orderDetails.status}
                    </span>
                </p>

                <hr />
                <h4>주문 항목</h4>
                <ul className="list-group">
                    {(orderDetails.orderItems || []).map((item) => (
                        // Fallback 안전망
                        <li key={item.productId || Math.random()} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    {/* 커스텀 향수 이름 */}
                                    <strong>{item.productName}</strong>

                                    {/* 커스텀 향수용 배지 */}
                                    {item.type === 'CUSTOM' && <span className="badge bg-secondary ms-2">Custom</span>}
                                    <br />
                                    <small>개당 ₩{item.price?.toLocaleString()}</small>
                                </div>
                                <span className="badge bg-primary rounded-pill">{item.quantity}개</span>
                            </div>

                            {/* --- 원액 표기 --- */}
                            {item.type === 'CUSTOM' && item.ingredients && item.ingredients.length > 0 && (
                                <div className="mt-2 ms-3" style={{ borderLeft: '3px solid #eee', paddingLeft: '10px' }}>
                                    <small><strong>Ingredients:</strong></small>
                                    <ul style={{ fontSize: '0.9em', paddingLeft: '20px', marginBottom: '0' }}>
                                        {item.ingredients.map((ing, index) => (
                                            <li key={index}>
                                                {ing.ingredientName}: {ing.amount}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </>
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
            </Modal.Footer>
        </Modal>
    );
}

export default OrderDetailsModal;