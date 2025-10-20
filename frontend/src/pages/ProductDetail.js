import { useState } from "react";
import { Button, Col, Container, FormControl, InputGroup, Nav, Row, Tab, Tabs } from "react-bootstrap";
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
                        width: '400px', height: '400px', objectFit: 'cover',   // 비율 유지하며 꽉 채우기, 넘치는 부분은 잘림
                        borderRadius: '8px'
                    }}></img>
                </Col>

                <Col style={{ textAlign: 'left' }}>
                    <h1>Powder Whisper</h1>
                    <p style={{ fontSize: '25px', marginTop: '20px' }}>38,000원</p>
                    <p>배송방법 | 택배 배송</p>
                    <p>배송비 | 4,000원</p>
                    <p>수량</p>

                    <InputGroup style={{ width: '150px' }}>
                        <Button variant="outline-secondary" onClick={handleDecrease}>-</Button>
                        <FormControl
                            type="number"
                            readOnly
                            className="text-center"
                        />
                        <Button variant="outline-secondary" onClick={handleIncrease}>+</Button>
                    </InputGroup>
                    <p>용량</p>
                    <p>총 상품가격</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '20px' }}>
                        {['#파우더리', '#플로럴', '#부드러움'].map((tag, idx) => (
                            <span
                                key={idx}
                                style={{
                                    padding: '4px 10px',
                                    backgroundColor: '#ebebebff',
                                    borderRadius: '20px',
                                    fontSize: '0.85em',
                                    color: '#555',
                                    border: '1px solid transparent',
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <p>흐드러지듯 귀부드러운 아이리스와 헬리오트로프, 솜사탕 같은 무드</p>
                    <button style={{ backgroundColor: '#000000ff', color: 'white', width: '25%', height: '45px', margin: '30px' }}>BUY IT NOW</button>
                    <button style={{ backgroundColor: '#ffffffff', width: '25%', height: '45px' }} >CART</button>
                </Col>
            </Row>
        </Container>

        <Tabs activeKey={key} onSelect={(k) => setKey(k)} style={{ marginTop: "70px" }}>
            <Tab eventKey="detail" title="Detail">
                <p>상세보기 내용</p>
            </Tab>
            <Tab eventKey="review" title="Review">
                <p>리뷰 내용</p>
            </Tab>
            <Tab eventKey="exchange" title="교환/반품 정보">
                <p>교환/반품 안내</p>
            </Tab>
        </Tabs>
    </>
    );
}

export default ProductDetail;