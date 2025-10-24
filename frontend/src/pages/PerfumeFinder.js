import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Form, FormControl } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";



function PerfumeTest() {
    const [product, setProduct] = useState([]);
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);


    useEffect(() => {
        const url2 = `${API_BASE_URL}/product/list?page=0&size=24`
        axios.get(url2)
            .then((response) => {
                console.log("응답받은 데이터2 :");
                console.log(response.data.content);
                setProduct(response.data.content);
            })
            .catch(error => {
                console.error('데이터 가져오기 실패:', error);
            })

    }, [selectedType]);

    const [filteredProducts, setFilteredProducts] = useState([]);
    const types = ['Powdery', 'Floral', 'Woody', 'Crystal', 'Chypre', 'Citrus', 'Fruity', 'Green']

    const handleButtonClick = (type) => {
        setSelectedType(type);
        const filtered = product.filter((item) =>
            item.category === type);
        setFilteredProducts(filtered);
    };

    const Test = () => {
        console.log(filteredProducts)
    }

    return (<>
        <div style={{ margin: 30, textAlign: 'center', color: '#6B4C3B' }}>
            <h2
                style={{
                    fontFamily: "'Gowun Batang', serif",
                    fontSize: '1.8rem',
                    marginBottom: 10,
                    textShadow: '1px 1px 2px #cfc1af',
                }}
            >
                Find Your Signature Scent            </h2>
            <p
                style={{
                    fontFamily: "'Nanum Myeongjo', serif",
                    fontSize: '1.1rem',
                    color: '#8C7A6B',
                    opacity: 0.8,
                    margin: 0,
                }}
            >
                나만의 향수를 찾아보세요! 아래 테스트를 시작하세요.            </p>
        </div>
        <div style={{ paddingLeft: '100px', paddingRight: '100px' }}>
            {/* 심리테스트 HTML 표시 */}
            <iframe
                src="/finder.html"
                title="향수 심리테스트"
                width="70%"
                height="920px" // 높이 너무 크면 아래 요소 안 보임!
                style={{
                    border: '1px solid #ebebebff',
                    marginBottom: '30px',
                }}
            />
        </div>

        {/* ------------------------추천향수 --------------------------------------- */}

        <div>
            <h1 style={{ fontFamily: "'Nanum Myeongjo', serif", color: "#65bba8ff" }}>
                <strong>What’s your perfume type?</strong>
                <br /><span style={{ fontSize: "22px" }}>__당신에게 어울리는 향수를 추천해드립니다.</span></h1>

            <div className="button-container">
                {types.map((item) => (
                    <button
                        key={item}
                        onClick={() => handleButtonClick(item)}
                        className={selectedType === item ? 'selected' : ''}
                        style={{ margin: "15px 0px 10px 0px" }}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {filteredProducts.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: '0 0 auto',
                        }}
                        className={selectedType === item ? 'selected' : ''}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center' }}
                            onClick={() => navigate(`/product/detail/${item.id}`)}>
                            <Card style={{ width: '18rem', marginRight: "20px", height: 'auto' }}>
                                <Card.Img variant="top" src={`${API_BASE_URL}/uploads/products/${item.imageUrl}`}
                                    style={{
                                        width: '100%',
                                        height: '250px',         // 원하는 높이 고정
                                        objectFit: 'cover',      // 이미지 영역에 꽉 차게, 잘라서 맞춤
                                        borderRadius: '4px 4px 0 0' // 카드 상단 모서리 둥글게 (선택사항)
                                    }} />
                                <Card.Body style={{ height: '150px' }}>
                                    <Card.Title style={{ textAlign: 'center' }}>{item.name}</Card.Title>
                                    <Card.Text
                                        style={{
                                            margin: '10px',
                                            textAlign: 'center',
                                            maxHeight: '120px',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.3em', fontWeight: 'bold' }}>{item.price.toLocaleString()}원</span><br />
                                        <Button
                                            style={{
                                                backgroundColor: "transparent",
                                                color: "#808080ff",
                                                border: "2px solid hsla(0, 0%, 50%, 1.00)",
                                                margin: "15px auto 0 auto",
                                                display: "block",
                                                fontSize: "12px",
                                            }}
                                        >
                                            add to cart
                                        </Button>
                                    </Card.Text>
                                </Card.Body>
                            </Card></div>
                    </div>
                ))}
            </div>
        </div>
        {/* ---------------------------배너-------------------------------------------- */}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <Card style={{ width: '80rem', height: '24rem', margin: '0px 55px 0px 55px', borderColor: '#dbdbdbff' }}>
                <Card.Body style={{
                    display: 'flex'
                }}>
                    < img
                        src="/qqq.jpg"
                        alt="..."
                        style={{
                            width: '310px',
                            height: '310px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            margin: '10px 0px 0px 50px',
                            marginLeft: '50px'
                        }}

                    />
                    {/* 오른쪽 텍스트 영역 */}
                    <div style={{ flex: 1, paddingLeft: '40px', paddingRight: '50px', marginTop: '18px' }}>

                        {/* 타이틀 부분 */}
                        <div>
                            <h5 style={{
                                fontSize: '40px',
                                fontWeight: 'bold',
                                color: '#67AB9F',
                                fontFamily: "'Gowun Batang', serif",
                                textAlign: 'left',
                                marginLeft: '50px' // 왼쪽으로 조금 들여쓰기
                            }}>
                                "Discover your scent and create
                            </h5>

                            <h5 style={{
                                fontSize: '30px',
                                fontWeight: 'bold',
                                color: '#67AB9F',
                                fontFamily: "'Gowun Batang', serif",
                                textAlign: 'right',           // 오른쪽 정렬
                                marginRight: '40px',          // 오른쪽 여백
                            }}>
                                a perfume as unique as you are."
                            </h5>
                        </div>

                        {/* 설명 + 버튼 */}
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px', backgroundColor: "#f5f5f5ff", borderRadius: '5px', padding: '10px' }}>
                            <p style={{
                                paddingLeft: '30px',
                                fontSize: '20px',
                                color: '#808080ff',
                                textAlign: 'left',
                                lineHeight: 1.4,
                                flex: 1,
                                marginTop: '12px'
                            }}>
                                <strong>당신의 향수 타입을 담아<br />세상에 하나뿐인 나만의 향수를 만들어보세요!</strong><br /><br />
                                <span style={{ fontSize: '19px' }}>
                                    세상에 하나뿐인,
                                    특별한 나만의 이야기를 시작하세요.
                                </span>
                            </p>

                            <button
                                style={{
                                    marginRight: '50px',
                                    padding: '10px 20px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    height: 'fit-content',
                                    backgroundColor: '#67AB9F',
                                    color: '#ffff',
                                    border: '2px solid #67AB9F',
                                    borderRadius: '5px',
                                    width: '100px'
                                }}>
                                NOW
                            </button>
                        </div>

                    </div>
                </Card.Body>
            </Card>
        </div>
    </>
    );
}

export default PerfumeTest;