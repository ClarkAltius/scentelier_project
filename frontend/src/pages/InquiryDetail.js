import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

function InquiryDetail() {
    const { id } = useParams(); // URL에서 문의 id 가져오기
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const { user } = useAuth();
    console.log(user);

    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        (async () => {
            try {
                const url = `${API_BASE_URL}/api/inquiries/${id}`;
                const res = await axios.get(url, { withCredentials: true });
                setInquiry(res.data?.data ?? res.data);
            } catch (e) {
                console.error(e);
                setError(e.response?.data?.message || "문의사항 정보를 불러오는 데 실패하였습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, navigate, user]);

    if (loading) return <p style={{ padding: "20px" }}>로딩중...</p>;
    if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;
    if (!inquiry) return <p>문의사항이 존재하지 않습니다.</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>{inquiry.title}</h2>
            <p><strong>작성일자:</strong> {new Date(inquiry.createdAt).toLocaleString()}</p>
            <p><strong>내용:</strong></p>
            <p>{inquiry.content}</p>
            <p><strong>답변 상태:</strong> {inquiry.status === "WAITING" ? "답변 대기 중" : "답변 완료"}</p>


            <Link to="/myinquiry" className="btn btn-outline-secondary mt-3">
                목록으로
            </Link>
        </div>
    );
}

export default InquiryDetail;
