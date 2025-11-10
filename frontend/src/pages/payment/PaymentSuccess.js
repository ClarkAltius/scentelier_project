import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/config";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { CheckCircle, Home, ListOrdered } from "lucide-react";

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
                const res = await axios.put(
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

    if (loading)
        return (
            <Container className="d-flex flex-column align-items-center justify-content-center" style={{ height: "80vh" }}>
                <Spinner animation="border" variant="success" />
                <p className="mt-3 fw-semibold">결제 승인 중입니다...</p>
            </Container>
        );

    return (
        <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: "80vh" }}>
            <Card className="shadow-lg border-0 p-4 rounded-4" style={{ maxWidth: "500px", width: "100%" }}>
                <div className="text-center mb-3">
                    <CheckCircle size={64} className="text-success mb-3" />
                    <h3 className="fw-bold text-success">결제가 완료되었습니다!</h3>
                    <p className="text-muted">주문이 정상적으로 처리되었습니다.</p>
                </div>

                {orderInfo && (
                    <div className="bg-light p-3 rounded-3 mb-4">
                        <div className="d-flex justify-content-between">
                            <span className="fw-semibold">주문 ID</span>
                            <span>{orderInfo.partner_order_id}</span>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <span className="fw-semibold">결제 금액</span>
                            <span className="text-success fw-bold">
                                ₩{Number(orderInfo.amount?.total).toLocaleString()}
                            </span>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <span className="fw-semibold">결제 승인 시간</span>
                            <span>{orderInfo.approved_at}</span>
                        </div>
                    </div>
                )}

                <div className="d-flex justify-content-between">
                    <Button
                        variant="outline-success"
                        className="d-flex align-items-center gap-2 flex-grow-1 me-2"
                        onClick={() => navigate("/")}
                    >
                        <Home size={18} /> 홈으로
                    </Button>
                    <Button
                        variant="success"
                        className="d-flex align-items-center gap-2 flex-grow-1"
                        onClick={() => navigate("/order/list")}
                    >
                        <ListOrdered size={18} /> 주문내역 보기
                    </Button>
                </div>
            </Card>
        </Container>
    );
}

export default PaymentSuccess;
