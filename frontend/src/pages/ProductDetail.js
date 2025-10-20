import { useState } from "react";
import { Button, Card, Col, Container, Form, FormControl, InputGroup, Row, Tab, Tabs } from "react-bootstrap";
import './../App.css'

function ProductDetail() {

    const [key, setKey] = useState('detail');

    const [quantity, setQuantity] = useState(1);

    const handleDecrease = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleIncrease = () => {
        setQuantity(quantity + 1);
    };


    return (<>
        <Container className="detail">
            <Row>
                <Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ddd.jpg" alt="향수이미지" style={{
                        width: '100%', height: '500px', objectFit: 'cover',   // 비율 유지하며 꽉 채우기, 넘치는 부분은 잘림
                        borderRadius: '8px', marginRight: "50px"
                    }}></img>
                </Col>

                <Col style={{ textAlign: 'left', marginTop: "70px" }}>
                    <h1>Powder Whisper</h1>
                    <p style={{ fontSize: '30px', marginTop: '20px' }}>38,000원</p>
                    <p style={{ fontSize: '20px', marginTop: "10px" }}>흐드러지듯 귀부드러운 아이리스와 헬리오트로프, 솜사탕 같은 무드</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '20px' }}>
                        {['#파우더리', '#플로럴', '#부드러움'].map((tag, idx) => (
                            <span
                                key={idx}
                                style={{
                                    padding: '4px 10px',
                                    backgroundColor: '#ebebebff',
                                    borderRadius: '20px',
                                    fontSize: '1em',
                                    color: '#555',
                                    border: '1px solid transparent',
                                    marginBottom: "20px"
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <p>수량</p>
                    <Form.Group style={{ width: '150px' }}>
                        <Form.Control
                            type="number"
                            min='1'
                            value={quantity}
                        >
                        </Form.Control>
                    </Form.Group>
                    <Form.Group style={{ marginTop: "30px", width: '150px' }} >
                        <Form.Label>용량</Form.Label>
                        <Form.Select
                            aria-label="Default select example"
                            className="mb-4"
                            name="category"
                            required
                        >
                            {/*주의) 자바의 Enum 열거형 타입에서 사용한 대문자를 반드시 사용해야 합니다.*/}
                            <option value="-">-선택하기-</option>
                            <option value="BREAD">30ml</option>
                            <option value="BEVERAGE">50ml</option>
                            <option value="CAKE">100ml</option>
                        </Form.Select>
                    </Form.Group>
                    <p>배송방법 | 택배 배송</p>
                    <p>배송비 | 4,000원</p>

                    <Card style={{ width: "580px", padding: '20px 30px 20px 30px', marginTop: "30px" }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontSize: '25px' }}>총 상품금액 |</div>
                            <div style={{ fontSize: '25px' }}>0원</div>
                        </div>
                    </Card>


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