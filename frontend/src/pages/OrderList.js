import { useEffect, useState /*, useContext*/ } from "react";
import { Alert, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../component/AuthContext";
// import { AuthContext } from "../contexts/AuthContext";

/** ---------- 정규화: ERD → ViewModel ---------- */
const normalizeOrder = (raw) => {
  const order_id = raw.order_id ?? raw.orderId ?? raw.id;
  const order_date = raw.order_date ?? raw.orderDate ?? raw.created_at ?? raw.createdAt;
  const order_status = raw.order_status ?? raw.status;

  // 하위 품목: order_product 테이블 조인
  const itemsRaw =
    raw.order_products ??
    raw.orderItems ??
    raw.items ??
    [];

  const orderItems = itemsRaw.map((x) => ({
    productName: x.product_name ?? x.productName ?? x.name ?? "상품",
    quantity: Number(x.quantity ?? x.qty ?? 0),
  }));

  return {
    orderId: order_id,
    orderDate: order_date,
    status: order_status,
    orderItems,
  };
};
/* --------------------------------------------- */

function OrderList() { // user 프롭스 제거
  //AuthContext 글로벌 컨텍스트에서 유저 정보 불러오기  
  const { user } = useAuth();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");


  useEffect(() => {
    if (!user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // ERD: orders.member_id 기반으로 목록 조회 (기존 API 유지)
        const url = `${API_BASE_URL}/order/list`;
        const params = { params: { memberId: user.id, role: user.role } };
        const res = await axios.get(url, params);

        const normalized = (res.data ?? []).map(normalizeOrder);
        setOrders(normalized);
      } catch (e) {
        console.error(e);
        setError("주문 목록을 불러 오는 데 실패하였습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);



  const makeAdminButton = (bean) => {

    if (user?.role !== "ADMIN" && user?.role !== "USER") return null;

    const changeStatus = async (newStatus) => {
      try {
        const url = `${API_BASE_URL}/order/update/status/${bean.orderId}?status=${newStatus}`;
        await axios.put(url, {}, { withCredentials: true });
        alert(`주문 ${bean.orderId}의 상태가 ${newStatus}로 변경되었습니다.`);
        setOrders((prev) => prev.filter((o) => o.orderId !== bean.orderId));
      } catch (e) {
        console.error(e);
        alert("상태 변경에 실패했습니다.");
      }
    };

    const orderCancel = async () => {
      try {
        const url = `${API_BASE_URL}/order/delete/${bean.orderId}`;
        await axios.delete(url, { withCredentials: true });
        alert(`주문 ${bean.orderId}이(가) 취소되었습니다.`);
        setOrders((prev) => prev.filter((o) => o.orderId !== bean.orderId));
      } catch (e) {
        console.error(e);
        alert("주문 취소에 실패했습니다.");
      }
    };

    return (
      <div>
        {user?.role === "ADMIN" && (
          <Button variant="success" size="sm" className="me-2" onClick={() => changeStatus("COMPLETED")}>
            완료
          </Button>
        )}
        <Button variant="danger" size="sm" className="me-2" onClick={orderCancel}>
          취소
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">주문 목록을 불러오는 중입니다.</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h1 className="my-4">주문 내역</h1>
      {orders.length === 0 ? (
        <Alert variant="secondary">주문 내역이 없습니다.</Alert>
      ) : (
        <Row>
          {orders.map((bean) => (
            <Col key={bean.orderId} md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <Card.Title>주문 번호 : {bean.orderId}</Card.Title>
                    <small className="text-muted">{bean.orderDate}</small>
                  </div>

                  <Card.Text>
                    상태 : <strong>{bean.status}</strong>
                  </Card.Text>

                  <ul style={{ paddingLeft: 20 }}>
                    {bean.orderItems?.map((item, idx) => (
                      <li key={idx}>
                        {item.productName} ({item.quantity}개)
                      </li>
                    ))}
                  </ul>

                  {makeAdminButton(bean)}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default OrderList;
