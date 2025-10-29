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

// 상품별 리뷰
export const getProductReviews = async (productId, page = 0, size = 5) => {
  const res = await axios.get(`${API_BASE}/product/${productId}?page=${page}&size=${size}`, { withCredentials: true });
  return res.data;
};