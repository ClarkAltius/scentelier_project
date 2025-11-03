import { useEffect, useState } from "react";
import { Card, Col, Container, Form, Pagination, Row, Tab, Tabs } from "react-bootstrap";
import './../App.css'
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import axios from "axios";
import { useAuth } from "../component/AuthContext";
import { getProductReviews } from "../api/reviewApi";
import ReviewCard from "../component/ReviewCard";

function ProductDetail() {
    const { user } = useAuth();
    const [key, setKey] = useState('detail');
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0.0);
    const [reviewCount, setReviewCount] = useState(0);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const { id } = useParams();

    // 상품 상세 조회
    useEffect(() => {
        const url = `${API_BASE_URL}/product/detail/${id}`;
        axios.get(url)
            .then((response) => setProduct(response.data))
            .catch((error) => {
                console.log("리액트 오류 내용" + error)
                alert("오류발생");
                navigate(-1);
            });
    }, [id]);

    // 리뷰 로딩
    const reviewLoading = () => {
        if (!product) return;
        getProductReviews(product.id, page, 6).then((data) => {
            setReviews(data.reviews?.content || []);
            setTotalPages(data.reviews?.totalPages || 1);
            setAverageRating(data.averageRating ?? 0.0);
            setReviewCount(data.reviewCount ?? 0);
        });
    };

    const totalPrice = (product?.price ?? 0) * quantity;

    if (!product) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const addToCart = async () => {
        if (quantity < 1 || isNaN(quantity)) {
            alert(`구매 수량은 1개 이상이어야 합니다.`);
            return;
        }
        try {
            const url = `${API_BASE_URL}/cart/insert`;
            const parameters = {
                userId: user.id,
                productId: id,
                quantity: quantity
            };

            const response = await axios.post(url, parameters, { withCredentials: true });
            alert(response.data);
            navigate('/product/list');
        } catch (error) {
            console.log('오류 발생 : ' + error);
            alert('장바구니 추가 실패');
        }
    };

    const handleDirectOrder = () => {
        if (!product) return;
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        navigate("/payments", {
            state: {
                products: [
                    {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: quantity,
                        imageUrl: product.imageUrl
                    },
                ],
                from: "productDetail",
            },
        });
    };

    return (
        <>
            {/* 상품 상세 */}
            <Container className="detail">
                <Row>
                    <Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={`${API_BASE_URL}/uploads/products/${product.imageUrl}`} alt="향수이미지"
                            style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '8px' }} />
                    </Col>

                    <Col style={{ textAlign: 'left', marginTop: "70px" }}>
                        <h1>{product.name}</h1>
                        <p style={{ fontSize: '25px', marginTop: '20px' }}>{product.price.toLocaleString()}원 / 30ml</p>
                        <p style={{ fontSize: '18px', marginTop: "10px" }}>{product.description}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                            {(product.keyword)
                                .split(',')
                                .map((tag, idx) => (
                                    <span key={idx}
                                        style={{
                                            padding: '4px 10px',
                                            backgroundColor: '#ebebebff',
                                            borderRadius: '20px',
                                            fontSize: '0.9em',
                                            color: '#555'
                                        }}>
                                        #{tag}
                                    </span>
                                ))}
                        </div>

                        <Form.Group style={{ width: '150px', marginTop: "30px" }}>
                            <Form.Label>수량</Form.Label>
                            <Form.Control
                                type="number"
                                min='1'
                                value={quantity}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value >= 1) setQuantity(value);
                                }}
                            />
                        </Form.Group>

                        <p style={{ marginTop: "30px" }}>배송비 | 무료</p>

                        <div style={{ display: "flex", justifyContent: "left" }}>
                            <Card style={{ width: "550px", padding: '20px 30px', marginTop: "10px", border: "2px solid #e9e9e9ff" }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <div style={{ fontSize: '25px', color: "#808080ff" }}>총 상품금액 |</div>
                                    <div style={{ fontSize: '25px' }}>
                                        <strong>{totalPrice.toLocaleString()}</strong> 원
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <button onClick={handleDirectOrder}
                            style={{ backgroundColor: '#000', color: 'white', width: '40%', height: '55px', margin: '30px' }}>
                            BUY IT NOW
                        </button>
                        <button
                            onClick={() => {
                                if (!user) {
                                    alert('로그인이 필요한 서비스입니다.');
                                    return navigate('/user/login');
                                } else { addToCart(); }
                            }}
                            style={{ backgroundColor: '#fff', width: '30%', height: '55px' }}>
                            CART
                        </button>
                    </Col>
                </Row>
            </Container>

            {/* 리뷰 탭 */}
            <div style={{ width: '100%', maxWidth: '100%', marginTop: "50px", padding: 0 }}>
                <Tabs
                    activeKey={key}
                    onSelect={(k) => { setKey(k); if (k === "review") reviewLoading(); }}
                    className="full-width-tabs"
                >
                    <Tab eventKey="detail" title="Detail" className="full-width-tabs">
                        {/* Detail 이미지 */}
                        <img src={`${API_BASE_URL}/uploads/Detail/${product.name}/Design.png`} style={{ margin: 100 }} />
                        <img src={`${API_BASE_URL}/uploads/Detail/${product.name}/2.png`} style={{ margin: 100 }} />
                        <img src={`${API_BASE_URL}/uploads/Detail/${product.name}/3.png`} style={{ margin: 100 }} />
                    </Tab>

                    <Tab eventKey="review" title="Review">
                        <div className="container mt-4">

                            {/* 리뷰 요약 영역 */}
                            <div className="text-center mb-4">
                                <h4>평균 별점 ⭐ {averageRating.toFixed(1)} / 5.0</h4>
                                <p className="text-muted">총 {reviewCount}개의 리뷰</p>
                            </div>

                            {reviews.length === 0 ? (
                                <div className="text-center py-5 border rounded bg-light">
                                    <p className="text-muted mb-3">아직 등록된 리뷰가 없습니다.</p>
                                    <p>평균 별점: <strong>0.0</strong></p>
                                </div>
                            ) : (
                                <>
                                    <div className="row">
                                        {reviews.map((review) => (
                                            <div className="col-md-6 col-lg-4" key={review.reviewId}>
                                                <ReviewCard review={review} type="product" />
                                            </div>
                                        ))}
                                    </div>

                                    <Pagination className="justify-content-center mt-4">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <Pagination.Item
                                                key={i}
                                                active={i === page}
                                                onClick={() => setPage(i)}
                                            >
                                                {i + 1}
                                            </Pagination.Item>
                                        ))}
                                    </Pagination>
                                </>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </>
    );
}

export default ProductDetail;
