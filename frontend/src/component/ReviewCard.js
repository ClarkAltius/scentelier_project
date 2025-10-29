// src/components/reviews/ReviewCard.js
import { Star } from "lucide-react";
import React, { useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ReviewCard = ({ review, type = "default", onUpdate, onDelete, onClick }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editContent, setEditContent] = useState(review?.content ?? "");
  const [editRating, setEditRating] = useState(review?.rating ?? 0);

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

  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const renderProducts = () =>
    products.map((p) => (
        <li key={p.productId} className="text-secondary small mb-1 text-muted">
            • {p.productName} × {p.quantity}
        </li>
    ));

    const handleSave = () => {
        if (onUpdate) {
            onUpdate({
                reviewId,
                content: editContent,
                rating: editRating,
            });
        }
        setShowEdit(false);
    };

    const handleDelete = () => {
        if (onDelete) onDelete(reviewId);
        setShowDelete(false);
    };

  // 카드 디자인 공통
  return (
    <>
    <Card className="card shadow border-0 rounded-4 mb-4" onClick={onClick}>
      <Card.Body>
        {/* 별점과 작성일 */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <div className="text-warning fs-5">{stars}</div>
          <small className="text-muted">
            {new Date(createdAt).toLocaleDateString()}
          </small>
        </div>

        {/* 리뷰 내용 */}
        <Card.Text className="card-text text-dark mb-3 fw-semibold" style={{ minHeight: "60px" }}>{content}</Card.Text>

        {/* 용도별 세부 렌더링 */}
        {type === "mypage" && (
          <>
            <div className="text-muted small">수령인: {recipientName}</div>
            <div className="text-muted small">총 금액: ₩{totalPrice}</div>
            <ul className="list-unstyled ms-3 mb-0">{renderProducts()}</ul>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="outline-primary" size="sm" onClick={() => setShowEdit(true)}>
                수정
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => setShowDelete(true)}>
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
    {/* 수정 모달 */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>리뷰 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>별점</Form.Label>
                <div className="d-flex justify-content-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={22}
                        onClick={() => setEditRating(star)}
                        style={{ cursor: "pointer" }}
                        color={editRating >= star ? "#FBBF24" : "#9CA3AF"}
                    />
                ))}
                </div>
            </Form.Group>
            <Form.Group>
              <Form.Label>내용</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave}>
            저장
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>리뷰 삭제</Modal.Title>
        </Modal.Header>
        <Modal.Body>정말 이 리뷰를 삭제하시겠습니까?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReviewCard;
