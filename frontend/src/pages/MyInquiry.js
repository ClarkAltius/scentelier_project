import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../component/AuthContext";
import { API_BASE_URL } from "../config/config";

function MyInquiry() {
    const [inquiries, setInquiries] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [checkedLogin, setCheckedLogin] = useState(false);
    const navigate = useNavigate();


    const { user } = useAuth();
    const TYPE_LABELS = {
        PRODUCT: "상품",
        DELIVERY: "배달",
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
                // setInquiries(data);
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

    if (!checkedLogin) return null;
    if (loading) return <p style={{ padding: "20px" }}>로딩중...</p>;
    if (error) return <p style={{ color: "red", padding: "20px" }}>에러: {error}</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>내 문의 내역</h2>

            {inquiries.length === 0 ? (
                <p>등록된 문의가 없습니다.</p>
            ) : (
                inquiries.map((inquiry) => (
                    <div
                        key={inquiry.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            borderRadius: "8px",
                            marginBottom: "15px",
                        }}
                    >
                        <Link to={`/inquiry/${inquiry.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                            <h3>{inquiry.title}</h3>
                        </Link>
                        <p>
                            <strong>작성일자:</strong> {new Date(inquiry.createdAt).toLocaleString()}
                        </p>
                        {inquiry.type && (
                            <p>
                                <strong>문의 유형 :</strong> {TYPE_LABELS[inquiry.type] || inquiry.type}
                            </p>
                        )}
                        {inquiry.productName && (
                            <p>
                                <strong>상품명 :</strong> {inquiry.productName}
                            </p>
                        )}
                        <p>
                            <strong>답변 상태:</strong> {inquiry.status === "PENDING" ? "WAITING" : "ANSWERED"}
                        </p>
                    </div>
                ))
            )}

            <Row>
                <Col className="text-end">
                    <Link to="/inquiry" className="btn btn-outline-secondary">
                        문의사항 페이지로
                    </Link>
                </Col>
                <Col className="text-first">
                    <Link to="/mypage" className="btn btn-outline-secondary">
                        마이페이지로
                    </Link>
                </Col>
            </Row>
        </div>
    );
}

export default MyInquiry;