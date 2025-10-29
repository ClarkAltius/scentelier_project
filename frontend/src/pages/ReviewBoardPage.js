// src/pages/reviews/AllReviewsPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReviewCard from "../component/ReviewCard";
import { Pagination } from "react-bootstrap";
import { useAuth } from "../component/AuthContext";
import { getAllReviews } from "../api/reviewApi";

const AllReviewsPage = () => {
    const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getAllReviews(page, 5).then((data) => {
      setReviews(data.content);
      setTotalPages(data.totalPages);
    });
  }, [page]);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">전체 리뷰</h3>
      {reviews.map((review) => (
        <div className="col-md-6 col-lg-4" key={review.reviewId}>
            <ReviewCard key={review.reviewId} review={review} type="all" />
        </div>
      ))}

      <Pagination className="justify-content-center mt-3">
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
    </div>
  );
};

export default AllReviewsPage;
