import React, { useState, useEffect } from "react";
import { Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import { Star, XCircle, CheckCircle, Send } from "lucide-react";
import axios from "axios";
import { useAuth } from "../component/AuthContext";
import { API_BASE_URL } from "../config/config";

const ReviewCreatePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 리뷰 안 쓴 주문 조회
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/reviews/unwritten/${user.id}`,
          { withCredentials: true }
        );
        console.log(res.data)
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        setError("리뷰 작성 가능한 주문 내역을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedOrderId) return alert("리뷰를 작성할 주문을 선택해주세요.");
    if (rating < 1 || rating > 5) return alert("별점을 1~5 사이로 선택해주세요.");
    if (!content.trim()) return alert("리뷰 내용을 입력해주세요.");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/reviews/write/${user.id}`,
        { orderId: selectedOrderId, rating, content },
        { withCredentials: true }
      );
      alert("리뷰가 성공적으로 작성되었습니다!");

      // 작성 후 주문 목록에서 제거
      setOrders((prev) => prev.filter((o) => o.orderId !== selectedOrderId));
      setSelectedOrderId(null);
      setRating(0);
      setContent("");
    } catch (err) {
      console.error(err);
      alert("리뷰 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 로딩
  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="secondary" />
        <p className="mt-3 text-muted">주문 내역을 불러오는 중...</p>
      </div>
    );

  // 오류
  if (error)
    return (
      <div className="text-center mt-5 text-danger">
        <XCircle size={48} className="mb-2" />
        <p>{error}</p>
      </div>
    );

  // 리뷰 작성 가능한 주문이 없을 때
  if (!orders.length)
    return (
      <div className="text-center mt-5 text-muted">
        <CheckCircle size={48} className="mb-2" />
        <p>리뷰 작성 가능한 주문이 없습니다.</p>
      </div>
    );

  // 선택한 주문 가져오기
  const selectedOrder =
    selectedOrderId && orders.length
      ? orders.find((o) => o.orderId === Number(selectedOrderId))
      : null;

  return (
    <div className="container mt-5">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-4 fw-bold">📝 리뷰 작성</h3>

        {/* 주문 선택 */}
        <Form.Group className="mb-4">
          <Form.Label>리뷰 작성할 주문 선택</Form.Label>
          <Form.Select
            value={selectedOrderId || ""}
            onChange={(e) => setSelectedOrderId(Number(e.target.value))}
          >
            <option value="">주문 선택...</option>
            {orders.map((o) => (
              <option key={o.orderId} value={o.orderId}>
                주문번호 #{o.orderId} | {new Date(o.orderDate).toLocaleString()} |{" "}
                {o.products.map((p) => p.productName).join(", ")}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* 선택한 주문 상품 목록 */}
        {selectedOrder && (
        <Card className="mb-3 p-3 bg-light">
            <h6 className="fw-semibold">📦 주문 상품</h6>
            <div className="mb-0">
            {selectedOrder.products.map((item) => (
                <div key={item.productId}>
                {item.productName} × {item.quantity} ({item.price.toLocaleString()}원)
                </div>
            ))}
            </div>
        </Card>
        )}

        {/* 리뷰 작성 폼 */}
        <Form.Group className="mb-3">
        <Form.Label>별점</Form.Label>
        <div className="d-flex justify-content-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={22}
                onClick={() => setRating(star)}
                className="cursor-pointer"
                color={rating >= star ? "#FBBF24" : "#9CA3AF"}
            />
            ))}
        </div>
        </Form.Group>


        <Form.Group className="mb-3">
          <Form.Label>리뷰 내용</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex justify-content-center">
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : <Send size={16} className="me-2" />}
            리뷰 등록
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReviewCreatePage;
