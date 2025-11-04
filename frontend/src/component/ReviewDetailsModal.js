import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import { User, Calendar, Star, ShoppingBag } from 'lucide-react';

// Re-using the StarRating component logic
const StarRating = ({ rating }) => (
    <div style={{ color: '#ffc107' }}> {/* Inline style for simplicity in modal */}
        {[...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={18}
                fill={index < rating ? '#ffc107' : 'none'}
                stroke={index < rating ? '#ffc107' : '#ccc'}
            />
        ))}
        <span className="ms-2">({rating} / 5)</span>
    </div>
);

function ReviewDetailsModal({ show, handleClose, review }) {
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show && review?.orderId) {
            const fetchOrderItems = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // We re-use the Order Detail endpoint to get order context
                    const url = `${API_BASE_URL}/api/admin/orders/${review.orderId}`;
                    const response = await axios.get(url, { withCredentials: true });
                    setOrderItems(response.data.orderItems || []);
                } catch (err) {
                    console.error("Failed to fetch order items:", err);
                    setError("리뷰의 주문 항목을 불러오는 데 실패했습니다.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrderItems();
        } else if (!show) {
            setOrderItems([]);
            setError(null);
        }
    }, [show, review]);

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>리뷰 상세 (ID: {review?.reviewId})</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {review && (
                    <>
                        {/* --- Review Info --- */}
                        <div className="mb-4 p-3 border rounded">
                            <h5><User size={18} /> {review.username} <small className="text-muted">({review.userEmail})</small></h5>
                            <hr />
                            <div className="mb-2">
                                <StarRating rating={review.rating} />
                            </div>
                            <p className="mb-1" style={{ fontSize: '1.1rem' }}>
                                {review.content}
                            </p>
                            <small className="text-muted">
                                <Calendar size={14} /> {new Date(review.createdAt).toLocaleString()}
                            </small>
                        </div>

                        {/* --- Order Context --- */}
                        <h5><ShoppingBag size={18} /> 주문 항목 (Order #{review.orderId})</h5>
                        {isLoading && <div className="text-center p-3"><Spinner size="sm" /></div>}
                        {error && <Alert variant="danger">{error}</Alert>}
                        {!isLoading && !error && orderItems.length > 0 && (
                            <Table striped bordered size="sm">
                                <thead>
                                    <tr>
                                        <th>상품명</th>
                                        <th>타입</th>
                                        <th>수량</th>
                                        <th>가격</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map(item => (
                                        <tr key={item.productId || item.customId}>
                                            <td>{item.productName}</td>
                                            <td>
                                                {item.type === 'CUSTOM' ?
                                                    <Badge bg="secondary">Custom</Badge> :
                                                    <Badge bg="info">Product</Badge>}
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>₩{item.price.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                        {!isLoading && !error && orderItems.length === 0 && (
                            <p className="text-muted">주문 항목을 찾을 수 없습니다.</p>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    닫기
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ReviewDetailsModal;