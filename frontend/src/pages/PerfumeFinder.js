import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";

function PerfumeTest() {
    const [product, setProduct] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [pendingType, setPendingType] = useState(null); // ✅ 테스트 결과 임시 저장
    const navigate = useNavigate();
    const { user } = useAuth();

    const types = ['Powdery', 'Floral', 'Woody', 'Crystal', 'Chypre', 'Citrus', 'Fruity', 'Green'];

    // 상품 데이터 가져오기
    useEffect(() => {
        const url2 = `${API_BASE_URL}/product/list`;
        axios.get(url2)
            .then((response) => {
                setProduct(response.data);
            })
            .catch(error => {
                console.error('데이터 가져오기 실패:', error);
            });
    }, []);

    // ✅ 상품이 로드되면 대기 중이던 타입으로 필터링
    useEffect(() => {
        if (product.length > 0 && pendingType) {
            handleButtonClick(pendingType);
            setPendingType(null); // 적용 후 초기화
        }
    }, [product, pendingType]);

    // ✅ iframe 메시지 수신
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === "TEST_RESULT") {
                const resultType = event.data.payload;

                // 상품이 이미 있으면 즉시 필터링, 아니면 pending
                if (product.length > 0) {
                    handleButtonClick(resultType);
                } else {
                    setPendingType(resultType);
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [product]);

    // 버튼 클릭 or 테스트 결과 적용 시 필터링
    const handleButtonClick = (type) => {
        setSelectedType(type);
        const filtered = product?.filter((item) =>
            (item.category || item.categoryName || "").toLowerCase() === type.toLowerCase()
        );
        setFilteredProducts(filtered);
    };


    const addToCart = async (e, product) => {
        try {
            const url = `${API_BASE_URL}/cart/insert`;
            const parameters = {
                userId: user.id,
                productId: product,
                quantity: 1
            };
            const response = await axios.post(url, parameters, { withCredentials: true });

            const goToCart = window.confirm("장바구니에 상품이 담겼습니다.\n장바구니로 이동하시겠습니까?");
            if (goToCart) {
                navigate("/cart/list");
            }
        } catch (error) {
            console.log('오류 발생 : ' + error);
            if (error.response) {
                alert('장바구니 추가 실패');
                console.log(error.response.data);
            }
        }
    }
    return (
        <>
            <div style={{ margin: 30, textAlign: 'center', color: '#6B4C3B' }}>
                <h2 style={{ fontFamily: "'Gowun Batang', serif", fontSize: '1.8rem' }}>Find Your Signature Scent</h2>
                <p style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '1.1rem', color: '#8C7A6B', opacity: 0.8 }}>
                    나만의 향수를 찾아보세요! 아래 테스트를 시작하세요.
                </p>
            </div>

            <div style={{ paddingLeft: '100px', paddingRight: '100px' }}>
                <iframe
                    src="/finder.html"
                    title="향수 심리테스트"
                    width="70%"
                    height="920px"
                    style={{ border: '1px solid #ebebebff', marginBottom: '30px' }}
                />
            </div>

            <div>
                <h1 style={{ fontFamily: "'Nanum Myeongjo', serif", color: "#65bba8ff" }}>
                    <strong>What’s your perfume type?</strong>
                    <br /><span style={{ fontSize: "22px" }}>__당신에게 어울리는 향수를 추천해드립니다.</span>
                </h1>

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
                                                onClick={(e) => {
                                                    if (!user) {
                                                        e.stopPropagation();

                                                        alert('로그인이 필요한 서비스입니다.');
                                                        navigate('/login');
                                                        return; // 로그인 페이지로 이동 후 종료
                                                    }

                                                    // 로그인된 경우에만 장바구니 추가 실행
                                                    e.stopPropagation();
                                                    addToCart(e, item.id);
                                                }}
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
                <Card
                    style={{
                        width: '90%',
                        maxWidth: '80rem',
                        height: '18rem',            // 카드 높이 줄임
                        margin: '0px auto',
                        borderColor: '#dbdbdbff',
                        overflow: 'hidden',         // 카드 영역 넘어가는 이미지 잘림
                    }}
                >
                    <Card.Body
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',          // 작은 화면에서 줄 바꿈
                            alignItems: 'center',
                            height: '100%',
                        }}
                    >
                        {/* 이미지 영역 */}
                        <div style={{
                            width: '280px',
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            flexShrink: 0,
                            marginLeft: '50px'
                        }}>
                            <img
                                src="/qqq.jpg"
                                alt="..."
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',     // 카드 높이에 맞춰 이미지 잘림
                                }}
                            />
                        </div>

                        {/* 텍스트 영역 */}
                        <div
                            style={{
                                flex: '1 1 280px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',  // 수직 가운데
                                alignItems: 'center',      // 수평 가운데
                                textAlign: 'center',       // 텍스트 중앙 정렬
                                padding: '10px 20px',
                                marginTop: "10px"
                            }}
                        >
                            {/* 타이틀 */}
                            <div>
                                <div>
                                    <h5 style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        color: '#67AB9F',
                                        fontFamily: "'Gowun Batang', serif",
                                        margin: '0'
                                    }}>
                                        "Discover your scent and create
                                    </h5>
                                    <h5 style={{
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        color: '#67AB9F',
                                        fontFamily: "'Gowun Batang', serif",
                                        margin: '0',
                                        marginTop: '0.5rem'
                                    }}>
                                        a perfume as unique as you are."
                                    </h5>
                                </div>
                            </div>

                            {/* 설명 + 버튼 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',  // 버튼과 텍스트 사이 공간 확보
                                marginTop: '20px',
                                backgroundColor: "#f5f5f5",
                                borderRadius: '5px',
                                padding: '15px 30px',             // 좌우 여백 넉넉하게
                                width: '100%',                     // 카드 폭에 맞춤
                                boxSizing: 'border-box',            // padding 포함 폭 조정
                                marginBottom: "30px"
                            }}>
                                <p style={{
                                    fontSize: '1.1rem',
                                    color: '#808080',
                                    textAlign: 'left',
                                    lineHeight: 1.4,
                                    flex: 1,
                                    marginTop: '0'
                                }}>
                                    <strong>당신의 향수 타입을 담아<br />세상에 하나뿐인 나만의 향수를 만들어보세요!</strong><br /><br />
                                    <span style={{ fontSize: '0.95rem' }}>
                                        세상에 하나뿐인, 특별한 나만의 이야기를 시작하세요.
                                    </span>
                                </p>

                                <button
                                    onClick={(e) => {
                                        if (!user) {
                                            e.stopPropagation();
                                            alert('로그인이 필요한 서비스입니다.');
                                            navigate('/login');
                                            return;
                                        }
                                        navigate('/perfume/blending');
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        backgroundColor: '#67AB9F',
                                        color: '#fff',
                                        border: '2px solid #67AB9F',
                                        borderRadius: '5px',
                                        width: '100px',
                                        flexShrink: 0
                                    }}
                                >
                                    NOW
                                </button>
                            </div>

                        </div>
                    </Card.Body>
                </Card>
            </div >
        </>
    );
}

export default PerfumeTest;