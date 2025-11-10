import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/config";

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orderInfo, setOrderInfo] = useState(null);

    useEffect(() => {
        const orderId = searchParams.get("orderId");
        const pgToken = searchParams.get("pg_token");

        if (!orderId || !pgToken) {
            alert("잘못된 접근입니다.");
            navigate("/");
            return;
        }

        const approvePayment = async () => {
            try {
                const res = await axios.post(
                    `${API_BASE_URL}/api/payment/success`,
                    null,
                    { params: { orderId, pgToken }, withCredentials: true }
                );
                setOrderInfo(res.data);
            } catch (err) {
                console.error(err);
                alert("결제 승인에 실패했습니다.");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        approvePayment();
    }, [searchParams, navigate]);

    if (loading) return <p>결제 승인 중...</p>;

    return (
        <div style={{ padding: "2rem" }}>
            <h2>결제가 완료되었습니다!</h2>
            {orderInfo && (
                <div>
                    <p>주문 ID: {orderInfo.partner_order_id}</p>
                    <p>결제 금액: {orderInfo.amount?.total}원</p>
                    <p>결제 승인 시간: {orderInfo.approved_at}</p>
                    <button onClick={() => navigate("/")}>홈으로</button>
                    <button onClick={() => navigate("/order/list")}>주문내역 보기</button>
                </div>
            )}
        </div>
    );
}

export default PaymentSuccess;
