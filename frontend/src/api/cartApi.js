import axios from "axios";
import { API_BASE_URL } from "../config/config";

export const fetchCartCount = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/cart/count`, {
      params: { userId },
      withCredentials: true,
    });
    return res.data.count;
  } catch (err) {
    console.error("장바구니 개수 조회 실패:", err);
    return 0;
  }
};
