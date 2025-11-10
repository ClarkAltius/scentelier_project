import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";
import "./InquiryDetail.css"; // 새로 만든 CSS 파일 import

// API_BASE_URL은 config 파일에서 가져오는 것이 좋습니다.
// (process.env는 빌드 시점에 정적으로 주입되므로, 유연성이 떨어질 수 있습니다.)
// 여기서는 원래 코드를 유지합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

function InquiryDetail({ setActiveView, inquiryId }) {
    const { id } = useParams(); // URL에서 문의 id 가져오기
    const [inquiry, setInquiry] = useState(null);
    const [productName, setProductName] = useState(""); // 상품명 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { user } = useAuth();

    const TYPE_LABELS = {
        PRODUCT: "상품",
        DELIVERY: "배송", // '배달'보다 '배송'이 적절할 수 있습니다.
        PAYMENT: "결제",
        ETC: "기타"
    };

    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        if (!inquiryId) {
            setError("No inquiry selected.");
            setLoading(false);
            return;
        }

        (async () => {
            try {
                setLoading(true); // 로딩 시작
                const url = `${API_BASE_URL}/api/inquiries/${inquiryId}`;
                const res = await axios.get(url, { withCredentials: true });
                const inquiryData = res.data?.data ?? res.data;
                setInquiry(inquiryData);

                // productId가 존재하면 상품 정보 가져오기
                if (inquiryData.productId) {
                    const productRes = await axios.get(`${API_BASE_URL}/api/products/${inquiryData.productId}`);
                    setProductName(productRes.data?.name || "상품명 없음");
                }
            } catch (e) {
                console.error(e);
                setError(e.response?.data?.message || "문의사항 정보를 불러오는 데 실패하였습니다.");
            } finally {
                setLoading(false); // 로딩 종료
            }
        })();
    }, [inquiryId, user]);

    // 삭제 
    const handleDelete = async () => {
        if (!window.confirm("정말 이 문의를 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/inquiries/${inquiryId}`, { withCredentials: true });
            alert("문의가 삭제되었습니다.");
            setActiveView('myInquiry');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "문의 삭제에 실패했습니다.");
        }
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

    // 답변 상태에 따른 CSS 클래스 동적 할당
    const statusClass = inquiry.status === "PENDING" ? "status-pending" : "status-answered";
    const statusText = inquiry.status === "PENDING" ? "WAITING" : "ANSWERED";

    return (
        <div className="inquiry-detail-page">
            <div className="inquiry-detail-card">
                <header className="inquiry-detail-header">
                    <h2>{inquiry.title}</h2>
                </header>

                <section className="inquiry-detail-info">
                    <p>
                        <strong>작성일자</strong>
                        {new Date(inquiry.createdAt).toLocaleString()}
                    </p>
                    {inquiry.type && (
                        <p>
                            <strong>문의 유형</strong>
                            {TYPE_LABELS[inquiry.type] || inquiry.type}
                        </p>
                    )}
                    {/* inquiry.productName이 아닌, state의 productName 사용하면 상품명 안뜸*/}
                    {inquiry.productName && (
                        <p>
                            <strong>문의 상품명</strong>
                            {inquiry.productName}
                        </p>
                    )}
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

                <div className="inquiry-detail-actions">
                    <button onClick={() => setActiveView('myInquiry')} className="btn-custom btn-secondary-custom">
                        목록으로
                    </button>
                    <button onClick={handleDelete} className="btn-custom btn-danger-custom">
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InquiryDetail;