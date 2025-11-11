import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";
import "./InquiryDetail.css"; // 새로 만든 CSS 파일 import

import InquiryChat from "../component/InquiryChat";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

function InquiryDetail({ setActiveView, inquiryId }) {
    const { id } = useParams();
    const [inquiry, setInquiry] = useState(null);
    const [productName, setProductName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { user } = useAuth(); //

    const TYPE_LABELS = {
        PRODUCT: "상품",
        DELIVERY: "배송",
        PAYMENT: "결제",
        ETC: "기타"
    };

    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        (async () => {
            try {
                setLoading(true);
                const url = `${API_BASE_URL}/api/inquiries/${inquiryId}`;
                const res = await axios.get(url, { withCredentials: true });
                const inquiryData = res.data?.data ?? res.data;
                setInquiry(inquiryData);

                if (inquiryData.productId) {
                    const productRes = await axios.get(`${API_BASE_URL}/api/products/${inquiryData.productId}`);
                    setProductName(productRes.data?.name || "상품명 없음");
                }
            } catch (e) {
                console.error(e);
                setError(e.response?.data?.message || "문의사항 정보를 불러오는 데 실패하였습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, [inquiryId, user]);

    const handleDelete = async () => {
    };

    if (loading) {
        return <div className="inquiry-message inquiry-loading">로딩중...</div>;
    }
    if (error) {
        return <div className="inquiry-message inquiry-error">{error}</div>;
    }
    if (!inquiry) {
        return <div className="inquiry-message">문의사항이 존재하지 않습니다.</div>;
    }

    const statusClass = inquiry.status === "PENDING" ? "status-pending" : "status-answered";
    const statusText = inquiry.status === "PENDING" ? "WAITING" : "ANSWERED";

    // --- 2. JSX 렌더링 수정 ---
    return (
        <div className="inquiry-detail-page">
            <div className="inquiry-detail-card">

                <header className="inquiry-detail-header">
                    <h2>{inquiry.title}</h2>
                </header>

                <section className="inquiry-detail-info">
                    <p>
                        <strong>답변 상태</strong>
                        <span className={`status-badge ${statusClass}`}>
                            {statusText}
                        </span>
                    </p>
                </section>

                <section className="inquiry-detail-content">
                    <strong>문의 내용</strong>
                    <div className="content-text">{inquiry.content}</div>
                </section>

                {/* --- 3. InquiryChat 컴포넌트 추가 --- */}
                {/* 원본 문의 하단에 대화 쓰레드를 추가합니다. */}
                <section className="inquiry-chat-section">
                    <hr />
                    <strong>대화 쓰레드</strong>
                    {/* * InquiryChat 컴포넌트가 모든 후속 답글을 로드하고,
                      * 답글 입력창을 제공합니다.
                      * 'inquiry.id'를 넘겨주기만 하면 됩니다.
                    */}
                    <InquiryChat inquiryId={inquiry.id} />
                </section>


                {/* --- 기존 액션 버튼 (수정 없음) --- */}
                <div className="inquiry-detail-actions">
                    <button onClick={() => setActiveView('myInquiry')} className="btn-custom btn-secondary-custom">
                        목록으로
                    </button>
                    {/* <button onClick={handleDelete} className="btn-custom btn-danger-custom">
                        삭제
                    </button> */}
                </div>
            </div>
        </div>
    );
}

export default InquiryDetail;