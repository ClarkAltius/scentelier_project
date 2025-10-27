import React, { useState, useEffect } from "react";
import { Card, Collapse, Table, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Truck, Package, XCircle, Info, ChevronDown, ChevronUp, AlertTriangle, ScrollText, CircleCheckBig } from "lucide-react";
import { useAuth } from "../component/AuthContext";
import { API_BASE_URL } from "../config/config";
import axios from "axios";

/** ---------- 정규화: ERD → ViewModel ---------- */
const normalizeOrder = (raw) => {
  const order_id = raw.order_id ?? raw.orderId ?? raw.id;
  const order_date = raw.order_date ?? raw.orderDate ?? raw.created_at ?? raw.createdAt;
  const order_status = raw.order_status ?? raw.status;
  const receiver = raw.recipientName ?? raw.receiver ?? raw.recipient_name ?? "-";

  const itemsRaw = raw.order_products ?? raw.orderItems ?? raw.items ?? [];

  const orderItems = itemsRaw.map((x) => ({
    productName: x.product_name ?? x.productName ?? x.name ?? "상품",
    quantity: Number(x.quantity ?? x.qty ?? 0),
    price: Number(x.price ?? 0),
    product_id: x.product_id ?? x.productId,
  }));

  return {
    orderId: order_id,
    orderDate: order_date,
    status: order_status,
    receiver: receiver,
    address: raw.address ?? "-",
    totalPrice: raw.totalPrice ?? 0,
    trackingNumber: raw.trackingNumber ?? raw.tracking_number ?? "미등록",
    paymentMethod: raw.paymentMethod ?? "미확인",
    orderItems,
  };
};
/* --------------------------------------------- */

const OrderList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 주문 데이터 로딩
  useEffect(() => {
    if (!user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      try {
        const url = `${API_BASE_URL}/order/ordered`;
        const params = { params: { userId: user.id, role: user.role }, withCredentials: true, };
        const res = await axios.get(url, params);
        const normalized = (res.data ?? []).map(normalizeOrder);
        console.log("Role: " + user.role);
        setOrders(normalized);
      } catch (err) {
        console.error(err);
        console.log("Role: " + user.role);
        setError("주문 내역을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  // 관리자 상태 변경 버튼
  const makeAdminButton = (order) => {
    if (user?.role !== "ADMIN") return null;

    const handleChangeStatus = async (newStatus) => {
      try {
        const url = `${API_BASE_URL}/order/update/status/${order.orderId}?status=${newStatus}`;
        await axios.put(url, {}, { withCredentials: true });
        alert(`주문 ${order.orderId}의 상태가 '${newStatus}'로 변경되었습니다.`);
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === order.orderId ? { ...o, status: newStatus } : o
          )
        );
      } catch (e) {
        console.error(e);
        alert("상태 변경에 실패했습니다.");
      }
    };

    return (
      <div className="mt-2">
        <Button
          size="sm"
          variant="outline-primary"
          className="me-2"
          onClick={() => handleChangeStatus("배송중")}
        >
          배송중
        </Button>
        <Button
          size="sm"
          variant="outline-success"
          onClick={() => handleChangeStatus("배송완료")}
        >
          배송완료
        </Button>
      </div>
    );
  };

  // 상태별 스타일 & 아이콘 지정
  const getStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return { color: "#3E8E41", bg: "#A0D995", icon: <CheckCircle size={18} /> };
      case "SHIPPED":
        return { color: "#1E81B0", bg: "#74C0FC", icon: <Truck size={18} /> };
      case "DELIVERED":
        return { color: "#6A5ACD", bg: "#BDB2FF", icon: <Package size={18} /> };
      case "CANCELLED":
        return { color: "#C92A2A", bg: "#FFA8A8", icon: <XCircle size={18} /> };
      default:
        return { color: "#555", bg: "#D3D3D3", icon: <Info size={18} /> };
    }
  };

  // 주문 상태 변경 함수
  const handleOrderAction = async (orderId, actionType) => {
    try {
      let newStatus = null;
      if (actionType === "cancel") newStatus = "CANCELLED";
      else if (actionType === "confirm") newStatus = "DELIVERED";

      if (!newStatus) return;

      await axios.put(`${API_BASE_URL}/orders/update/status/${orderId}?status=${newStatus}`, {}, { withCredentials: true });

      // 상태 변경 후 UI 업데이트
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (e) {
      console.error(e);
      alert("주문 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const toggleOpen = (orderId) => {
    setOpenOrderId(openOrderId === orderId ? null : orderId);
  };

  const gotoProduct = (productId) => {
    navigate(`/product/detail/${productId}`);
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="secondary" />
        <p className="mt-3 text-muted">주문 내역을 불러오는 중...</p>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <div className="text-center text-danger mt-5">
        <AlertTriangle size={40} className="mb-3" />
        <p>{error}</p>
      </div>
    );
  }

  // 데이터 없음
  if (orders.length === 0) {
    return (
      <div className="text-center text-muted mt-5">
        <Package size={48} className="mb-3 opacity-75" />
        <p>주문 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h3 className="mb-4 fw-bold"><ScrollText size={30} /> 주문 내역</h3>

      {orders.map((order) => {
        const statusStyle = getStatusStyle(order.status);
        return (
          <Card
            key={order.orderId}
            className={`mb-3 shadow-sm border-0 ${order.status === "CANCELLED" ? "opacity-50" : ""
              }`}
            style={{
              borderLeft: `6px solid ${statusStyle.color}`,
              borderRadius: "12px",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <Card.Header
              className="d-flex justify-content-between align-items-center"
              style={{
                cursor: "pointer",
                backgroundColor:
                  openOrderId === order.orderId ? "#f8f9fa" : "white",
              }}
              onClick={() => toggleOpen(order.orderId)}
            >
              <div>
                <strong>주문번호 #{order.orderId}</strong>
                <span className="text-muted ms-2">{order.orderDate}</span>
              </div>

              <div
                className="d-flex align-items-center px-2 py-1 rounded-pill"
                style={{
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                  fontWeight: "500",
                  fontSize: "0.9rem",
                }}
              >
                {statusStyle.icon}
                <span className="ms-2">{order.status}</span>
                {openOrderId === order.orderId ? (
                  <ChevronUp size={18} className="ms-2" />
                ) : (
                  <ChevronDown size={18} className="ms-2" />
                )}
              </div>
            </Card.Header>

            <Collapse in={openOrderId === order.orderId}>
              <div>
                <Card.Body className="bg-light rounded-bottom">
                  <h6 className="fw-semibold mb-2"><Package size={18} /> 주문 상품</h6>
                  <Table hover size="sm" className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>상품명</th>
                        <th>수량</th>
                        <th>가격</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{ cursor: "pointer" }}
                          onClick={() => gotoProduct(item.product_id)}
                        >
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price.toLocaleString()}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="mt-3 text-muted">
                    <p><strong>수취인:</strong> {order.receiver}</p>
                    <p><strong>배송지:</strong> {order.address}</p>
                    <p><strong>결제수단:</strong> {order.paymentMethod}</p>
                    <p><strong>총 결제금액:</strong> {order.totalPrice.toLocaleString()}원</p>
                    <p><strong>운송장 번호:</strong> {order.trackingNumber}</p>
                  </div>

                  {/* 관리자 버튼 */}
                  {makeAdminButton(order)}

                  {/* 상태별 버튼 */}
                  <div className="mt-3 text-end">
                    {(order.status === "PENDING" || order.status === "PAID") && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleOrderAction(order.orderId, "cancel")}
                      >
                        <XCircle size={16} className="me-1" /> 주문 취소
                      </Button>
                    )}

                    {(order.status === "SHIPPED" ||
                      order.status === "DELIVERED") && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleOrderAction(order.orderId, "confirm")}
                        >
                          <CircleCheckBig size={16} className="me-1" /> 수취 확인
                        </Button>
                      )}
                  </div>
                </Card.Body>
              </div>
            </Collapse>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderList;
