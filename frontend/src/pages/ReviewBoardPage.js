// src/pages/reviews/AllReviewsPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReviewCard from "../component/ReviewCard";
import { Button, Pagination } from "react-bootstrap";
import { useAuth } from "../component/AuthContext";
import { getAllReviews } from "../api/reviewApi";
import { useNavigate } from "react-router-dom";

const AllReviewsPage = () => {
    const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    getAllReviews(page, 5).then((data) => {
      setReviews(data.content);
      setTotalPages(data.totalPages);
    });
  }, [page]);

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">전체 리뷰</h3>

      {reviews.length === 0 ? (
        <div className="text-center py-5 border rounded bg-light">
          <p className="text-muted mb-3">아직 등록된 리뷰가 없습니다.</p>
          <Button variant="success" onClick={() => navigate("/reviews/write")}>
            첫 리뷰 남기기
          </Button>
        </div>
      ) : (
        <>
          <div className="row">
            {reviews.map((review) => (
              <div className="col-md-6 col-lg-4" key={review.reviewId}>
                <ReviewCard review={review} type="all" />
              </div>
            ))}
          </div>

          <Pagination className="justify-content-center mt-4">
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={i === page}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}
    </div>
  );
};

export default AllReviewsPage;
