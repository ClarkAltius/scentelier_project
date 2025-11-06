import React, { useEffect, useState } from "react";
import axios from "axios";
// Row, Col 대신 Link만 사용하므로 react-bootstrap import는 제거해도 됩니다.
// import { Row, Col } from "react-bootstrap"; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../component/AuthContext";
import { API_BASE_URL } from "../config/config";
import "./MyInquiry.css"; // 새로 만든 CSS 파일 import

function MyInquiry() {
    const [inquiries, setInquiries] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [checkedLogin, setCheckedLogin] = useState(false);
    const navigate = useNavigate();

    const { user } = useAuth();
    const TYPE_LABELS = {
        PRODUCT: "상품",
        DELIVERY: "배달", // '배달' -> '배송'이 더 일반적일 수 있습니다.
        PAYMENT: "결제",
        ETC: "기타"
    };

    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        setCheckedLogin(true);

        (async () => {
            try {
                const url = `${API_BASE_URL}/api/inquiries/my`;
                const res = await axios.get(url, { withCredentials: true });
                const data = res.data?.data ?? res.data ?? [];
                console.log("inquiry data:", data);

                const inquiriesWithProducts = await Promise.all(
                    data.map(async (inquiry) => {
                        if (inquiry.productId) {
                            try {
                                const productRes = await axios.get(
                                    `${API_BASE_URL}/api/products/${inquiry.productId}`
                                );
                                return {
                                    ...inquiry,
                                    productName:
                                        productRes.data?.name || "상품명 없음",
                                };
                            } catch (err) {
                                console.error(
                                    "상품 정보를 불러오지 못했습니다:",
                                    err
                                );
                                return {
                                    ...inquiry,
                                    productName: "상품명 불러오기 실패",
                                };
                            }
                        } else {
                            return inquiry;
                        }
                    })
                );

                setInquiries(inquiriesWithProducts);
            } catch (e) {
                console.error(e);
                setError(e.response?.data?.message || "문의사항 목록을 불러오는 데 실패하였습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, [user, navigate]);

    if (!checkedLogin) return null; // 로그인 체크 전에는 아무것도 렌더링하지 않음

    // 로딩 및 에러 상태를 좀 더 명확하게 표시
    if (loading) {
        return <div className="inquiry-message inquiry-loading">로딩중...</div>;
    }
    if (error) {
        return <div className="inquiry-message inquiry-error">에러: {error}</div>;
    }

    return (
        <div className="my-inquiry-container">
            <h1 style={{ fontFamily: "'Gowun Batang', serif" }}>My Questions</h1>

            {
                inquiries.length === 0 ? (
                    <div className="inquiry-message">등록된 문의가 없습니다.</div>
                ) : (
                    inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="inquiry-card">
                            <Link to={`/inquiry/${inquiry.id}`} className="inquiry-card-link">
                                <h3>{inquiry.title}</h3>
                                <div className="inquiry-details">
                                    <p>
                                        <strong>작성일자:</strong> {new Date(inquiry.createdAt).toLocaleString()}
                                    </p>
                                    {inquiry.type && (
                                        <p>
                                            <strong>문의 유형:</strong> {TYPE_LABELS[inquiry.type] || inquiry.type}
                                        </p>
                                    )}
                                    {inquiry.productName && (
                                        <p>
                                            <strong>상품명:</strong> {inquiry.productName}
                                        </p>
                                    )}
                                    <p>
                                        <strong>답변 상태:</strong>
                                        <span className={inquiry.status === "PENDING" ? "status-pending" : "status-answered"}>
                                            {inquiry.status === "PENDING" ? "WAITING" : "ANSWERED"}
                                        </span>
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))
                )
            }

            {/* react-bootstrap Row/Col 대신 flexbox로 재구성 */}
            <div className="inquiry-actions">
                <Link to="/mypage" className="btn-custom btn-secondary-custom">
                    마이페이지로
                </Link>
                <Link to="/inquiry" className="btn-custom btn-primary-custom">
                    문의하기
                </Link>
            </div>
        </div >
    );
}

export default MyInquiry;