// src/components/reviews/ReviewCard.js
import { Star } from "lucide-react";
import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ReviewCard = ({ review, type = "default", onEdit, onDelete, onClick }) => {
  if (!review) return null;

  const {
    reviewId,
    content,
    rating,
    createdAt,
    recipientName,
    totalPrice,
    products = []
  } = review;

  const renderStars = () => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={18}
        className={`me-1 ${i < rating ? "text-warning" : "text-secondary"}`}
        fill={i < rating ? "currentColor" : "none"}
      />
    ));
  };

  const gotoProduct = () => {

  }

  const renderProducts = () =>
    products.map((p) => (
        <li key={p.productId} className="text-secondary small mb-1" onClick={()=>gotoProduct()}>
            • {p.productName} × {p.quantity}
        </li>
    ));

  // 카드 디자인 공통
  return (
    <Card className="card shadow border-0 rounded-4 mb-4" onClick={onClick}>
      <Card.Body>
        {/* 별점과 작성일 */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <div>{renderStars()}</div>
          <small className="text-muted">
            {new Date(createdAt).toLocaleDateString()}
          </small>
        </div>

        {/* 리뷰 내용 */}
        <Card.Text className="card-text text-dark mb-3" style={{ minHeight: "60px" }}>{content}</Card.Text>

        {/* 용도별 세부 렌더링 */}
        {type === "mypage" && (
          <>
            <div className="text-muted small">수령인: {recipientName}</div>
            <div className="text-muted small">총 금액: ₩{totalPrice}</div>
            <ul className="list-unstyled ms-3 mb-0">{renderProducts()}</ul>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="outline-primary" size="sm" onClick={onEdit}>
                수정
              </Button>
              <Button variant="outline-danger" size="sm" onClick={onDelete}>
                삭제
              </Button>
            </div>
          </>
        )}

        {type === "all" && (
          <>
            <div className="text-muted small">수령인: {recipientName}</div>
           <ul className="list-unstyled ms-3 mb-0">{renderProducts()}</ul>
          </>
        )}

        {type === "product" && (
          <>
            <div className="text-muted small">수령인: {recipientName}</div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReviewCard;
