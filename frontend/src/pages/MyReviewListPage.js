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
            onEdit={() => alert("수정 기능")}
            onDelete={() => alert("삭제 기능")}
            />
        </div>
      ))}
      </div>
    </div>
  );
};

export default MyReviewPage;
