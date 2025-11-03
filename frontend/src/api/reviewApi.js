import axios from "axios";
import { API_BASE_URL } from "../config/config";

const API_BASE = `${API_BASE_URL}/reviews`;

// 작성 가능한 주문 목록
export const getUnwrittenOrders = async (userId) => {
  const res = await axios.get(`${API_BASE}/unwritten/${userId}`, { withCredentials: true });
  return res.data;
};

// 리뷰 작성
export const createReview = async (userId, data) => {
  const res = await axios.post(`${API_BASE}/write/${userId}`, data, { withCredentials: true });
  return res.data;
};

// 내 리뷰 목록
export const getUserReviews = async (userId, page = 0, size = 5) => {
  const res = await axios.get(`${API_BASE}/user/${userId}?page=${page}&size=${size}`, { withCredentials: true });
  return res.data;
};

// 전체 리뷰
export const getAllReviews = async (page = 0, size = 10) => {
  const res = await axios.get(`${API_BASE}/all?page=${page}&size=${size}`, { withCredentials: true });
  return res.data;
};

/**
 * 상품별 리뷰 목록 + 평균 별점 + 리뷰 개수 조회
 * @param {number} productId 상품 ID
 * @param {number} page 페이지 번호
 * @param {number} size 페이지 크기
 * @returns {{
 *   reviews: Object, // Page 객체 (content, totalPages, etc)
 *   averageRating: number,
 *   reviewCount: number
 * }}
 */
export const getProductReviews = async (productId, page = 0, size = 6) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviews/product/${productId}`, {
      params: { page, size },
    });

    // 백엔드가 { reviews, averageRating, reviewCount } 형태로 응답
    const { reviews, averageRating, reviewCount } = response.data;

    return {
      reviews: reviews || { content: [], totalPages: 1 },
      averageRating: averageRating ?? 0.0,
      reviewCount: reviewCount ?? 0,
    };
  } catch (error) {
    console.error("리뷰 불러오기 실패:", error);
    return {
      reviews: { content: [], totalPages: 1 },
      averageRating: 0.0,
      reviewCount: 0,
    };
  }
};