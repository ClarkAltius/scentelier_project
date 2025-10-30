// src/pages/reviews/MyReviewPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReviewCard from "../component/ReviewCard";
import { getUserReviews } from "../api/reviewApi";
import { useAuth } from "../component/AuthContext";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const MyReviewPage = () => {
    const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getUserReviews(user.id, 0, 12).then((data) => setReviews(data.content)).catch(console.error);
  }, [user.id]);

  const handleUpdate = (updated) => {
    axios
      .put(`${API_BASE_URL}/reviews/update/${updated.reviewId}`, updated, { withCredentials: true })
      .then(() => {
        alert("리뷰가 수정되었습니다.");
        setReviews((prev) =>
          prev.map((r) =>
            r.reviewId === updated.reviewId
              ? { ...r, ...updated }
              : r
          )
        );
      })
      .catch(() => alert("수정 중 오류가 발생했습니다."));
  };

  const handleDelete = (reviewId) => {
    axios
      .put(`${API_BASE_URL}/reviews/delete/${reviewId}`, { withCredentials: true })
      .then(() => {
        alert("리뷰가 삭제되었습니다.");
        setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
      })
      .catch(() => alert("삭제 중 오류가 발생했습니다."));
  };

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">내가 작성한 리뷰</h3>
      {reviews.length === 0 ? (
        <div className="text-center py-5 border rounded bg-light">
            <p className="text-muted mb-3">아직 작성한 리뷰가 없습니다.</p>
            <Button variant="primary" onClick={() => navigate("/reviews/write")}>
                리뷰 작성하러 가기
            </Button>
        </div>
      ) : (
        <div className="row">
            {reviews.map((review) => (
                <div className="col-md-6 col-lg-4" key={review.reviewId}>
                <ReviewCard
                    review={review}
                    type="mypage"
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
                </div>
            ))}
            <Button variant="primary" onClick={() => navigate("/reviews/write")}>
                리뷰 작성하러 가기
            </Button>
        </div>
      )}
        
    </div>
  );
};

export default MyReviewPage;
