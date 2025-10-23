import { useEffect, useState } from "react";
import { Card, Col, Container, Form, Row, Tab, Tabs } from "react-bootstrap";
import './../App.css'
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import axios from "axios";

function ProductDetail() {

    const [key, setKey] = useState('detail');
    const [quantity, setQuantity] = useState(1);
    const [total, setTotal] = useState();
    // ------------------------------------------------------------------------------
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const url = `${API_BASE_URL}/product/detail/${id}`;

        //파라미터 id가 갱신이 되면 화면을 다시 rendering 시킵니다.
        axios.get(url)
            .then((response) => {
                setProduct(response.data)
                console.log(response.data)

            })
            .catch((error) => {
                console.log("리액트 오류 내용" + error)
                alert("오류발생");
                navigate(-1) // 이전페이지로 이동하기

            })


        if (product) {
            setTotal(product.price * quantity);
        }

    }, [id, quantity])

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





    return (<>
        <Container className="detail">
            <Row>
                <Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src={`${API_BASE_URL}/uploads/products/${product.imageUrl}`} alt="향수이미지" style={{
                        width: '100%', height: '500px', objectFit: 'cover',   // 비율 유지하며 꽉 채우기, 넘치는 부분은 잘림
                        borderRadius: '8px', marginRight: "50px"
                    }}></img>
                </Col>

                <Col style={{ textAlign: 'left', marginTop: "70px" }}>
                    <h1>{product.name}</h1>
                    <p style={{ fontSize: '25px', marginTop: '20px' }}>{product.price.toLocaleString()}원 /  30ml</p>
                    <p style={{ fontSize: '18px', marginTop: "10px" }}>{product.description
                    }</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                        {(product.keyword)
                            .split(',')
                            .map((tag, idx) => (
                                <span
                                    key={idx}
                                    style={{
                                        padding: '4px 10px',
                                        backgroundColor: '#ebebebff',
                                        borderRadius: '20px',
                                        fontSize: '0.9em',
                                        color: '#555',
                                        border: '1px solid transparent',
                                    }}
                                >
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
                        >
                        </Form.Control>
                    </Form.Group>

                    <p style={{ marginTop: "30px" }}>배송비 | 무료</p>

                    <div style={{ display: "flex", justifyContent: "left" }}>
                        <Card style={{ width: "550px", padding: '20px 30px 20px 30px', marginTop: "10px", border: "2px solid #e9e9e9ff" }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: "0px 50px 0px 30px" }}>
                                <div style={{ fontSize: '25px', color: "#808080ff" }}>총 상품금액 |</div>
                                <div style={{ fontSize: '25px' }}>
                                    <strong>{totalPrice.toLocaleString()}</strong> 원                                </div>
                            </div>
                        </Card>
                    </div>


                    <button style={{ backgroundColor: '#000000ff', color: 'white', width: '40%', height: '55px', margin: '30px' }}>BUY IT NOW</button>
                    <button style={{ backgroundColor: '#ffffffff', width: '30%', height: '55px' }} >CART</button>
                </Col>
            </Row>
        </Container >

        <div style={{ width: '100%', maxWidth: '100%', marginTop: "50px", padding: 0 }}>
            <Tabs
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="full-width-tabs"
            >
                <Tab
                    eventKey="detail"
                    title="Detail"
                    className="full-width-tabs"
                >
                    <p>상세보기 내용</p>
                </Tab>
                <Tab
                    eventKey="review"
                    title="Review"
                >
                    <div style={{ display: 'flex', padding: '10px', gap: '20px', width: '100%', marginTop: "50px" }}>
                        {/* 왼쪽 영역: 화면 1/4 너비 */}
                        <div style={{ width: '25%' }}>
                            <p>★★★★★ </p>
                            <p>아이디</p>
                            <p>작성일</p>
                        </div>

                        {/* 오른쪽 영역: 나머지 3/4 차지 */}
                        <div style={{ width: '75%', textAlign: "left" }}>
                            <img
                                src="/ddd.jpg"
                                style={{ width: '30%', height: '300px', objectFit: 'cover' }}
                                alt="review"
                            />
                            <p>아주조아요</p>
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </div>

    </>
    );
}

export default ProductDetail;