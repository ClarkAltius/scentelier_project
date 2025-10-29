// src/pages/reviews/MyReviewPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReviewCard from "../component/ReviewCard";
import { getUserReviews } from "../api/reviewApi";
import { useAuth } from "../component/AuthContext";

const MyReviewPage = () => {
    const { user } = useAuth();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getUserReviews(user.id).then((data) => setReviews(data.content)).catch(console.error);
  }, [user.id]);

  const handleUpdate = (updated) => {
    axios
      .put(`/reviews/${updated.reviewId}`, updated)
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
      .delete(`/reviews/${reviewId}`)
      .then(() => {
        alert("리뷰가 삭제되었습니다.");
        setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
      })
      .catch(() => alert("삭제 중 오류가 발생했습니다."));
  };

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">내가 작성한 리뷰</h3>
      <div className="row">
      {reviews.map((review) => (
        <div className="col-md-6 col-lg-4" key={review.reviewId}>
            <ReviewCard
            key={review.reviewId}
            review={review}
            type="mypage"
            onUpdate={() => handleUpdate}
            onDelete={() => handleDelete}
            />
        </div>
      ))}
      </div>
    </div>
  );
};

export default MyReviewPage;
