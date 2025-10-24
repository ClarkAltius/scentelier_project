import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Form, FormControl } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";


function Productlist() {
    const containerRef = useRef();
    const [extended, setExtended] = useState([]);
    const [best, setBest] = useState([]);
    const [product, setProduct] = useState([]);
    const [visibleCount, setVisibleCount] = useState(6);
    const navigate = useNavigate();
    const { user } = useAuth();



    // 썸네일 목록 - 3번 반복해 무한 루프 효과


    useEffect(() => {// 베스트상품 스크롤 관련
        const container = containerRef.current;

        const url1 = `${API_BASE_URL}/order/list2`
        const url2 = `${API_BASE_URL}/product/list?page=0&size=24`
        axios.get(url1)
            .then((response) => {
                console.log("응답받은 데이터 :");
                console.log(response.data);
                setBest(response.data);
                setExtended([...response.data, ...response.data, ...response.data]);
            })
            .catch(error => {
                console.error('데이터 가져오기 실패:', error);
            })


        axios.get(url2)
            .then((response) => {
                console.log("응답받은 데이터2 :");
                console.log(response.data.content);
                setProduct(response.data.content);
            })
            .catch(error => {
                console.error('데이터 가져오기 실패:', error);
            })
        if (!container) return;

        const singleWidth = container.scrollWidth / 3;
        container.scrollLeft = singleWidth;

        let scrollInterval;
        let scrollTimeout;

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                if (container.scrollLeft >= singleWidth * 2) {
                    container.scrollLeft = singleWidth;
                } else {
                    container.scrollLeft += 3;//한 번에 <씩 이동해서 더 빨라짐
                }
            }, 30);//마다 실행해서 좀 더 부드럽고 빠르게
        };

        const stopAutoScroll = () => {
            clearInterval(scrollInterval);
        };

        const resetAutoScrollTimeout = () => {
            clearTimeout(scrollTimeout);
            stopAutoScroll();
            scrollTimeout = setTimeout(() => {
                startAutoScroll();
            }, 10); // 1초 후 자동 스크롤 재개
        };

        const onScroll = () => {
            resetAutoScrollTimeout();
        };

        const onWheel = (e) => {
            e.preventDefault();
            container.scrollLeft += e.deltaY; // 휠 세로 이동을 가로로 바꿈
            resetAutoScrollTimeout();
        };

        container.addEventListener('scroll', onScroll);
        container.addEventListener('wheel', onWheel, { passive: false });

        startAutoScroll();

        return () => {
            clearInterval(scrollInterval);
            clearTimeout(scrollTimeout);
            container.removeEventListener('scroll', onScroll);
            container.removeEventListener('wheel', onWheel);
        };

    }, []);

    useEffect(() => { // 하단 상품  스크롤 관련
        const handleScroll = () => {
            // 현재 스크롤 위치 + 화면 높이 >= 문서 전체 높이 - 100 (임계점 설정)
            if (
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 100
            ) {
                // 아직 상품이 더 남아있으면 6개씩 더 보여줌
                setVisibleCount((prev) => {
                    if (prev < product.length) {
                        return prev + 6;
                    }
                    return prev;
                });
            }
        };

        window.addEventListener("scroll", handleScroll);

        // 클린업 함수: 컴포넌트 언마운트 시 이벤트 제거
        return () => window.removeEventListener("scroll", handleScroll);
    }, [product.length]);

    // ---------------------------카테고리---------------------------------

    const types = ['Powdery', 'Woody', 'Crystal', 'Chypre', 'Citrus', 'Fruity', 'Green'];
    const seasons = ['SPRING', 'SUMMER', 'FALL', 'WINTER'];

    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedTag, setSelectedTag] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState(product);
    const [searchTerm, setSearchTerm] = useState("");


    const toggleCategory = (category) => {
        if (category === "all") {
            setFilteredProducts(product)
        };
        setActiveCategory(category);
        setSelectedTag(null);
        setSearchTerm("");  // 카테고리 바뀌면 선택된 태그 초기화
    };

    const categoriesToShow =
        activeCategory === 'all' ? [] :
            activeCategory === 'type' ? types :
                activeCategory === 'season' ? seasons :
                    [];

    const handleTagClick = (tag, category = activeCategory) => {
        setSelectedTag(tag);

        console.log("선택한 태그", tag);
        setSearchTerm("");

        const filtered = product.filter((item) => {
            if (category === "type") {
                return item.category?.toLowerCase().includes(tag.toLowerCase());
            } else if (category === "season") {
                return item.season?.toLowerCase().includes(tag.toLowerCase());
            }
            return true;
        });

        setFilteredProducts(filtered);
    };

    // ---------------------------검색관련---------------------------------

    const seachTag = (tag) => {
        setSearchTerm(tag);
        setActiveCategory("all");
    }

    const tags = () => {

        const tag = ["부드러움", '포근함', '따뜻함', '달콤함', '청량함', '플로럴', '가을향', '겨울향', '우아함', '봄', '섬세함', '상쾌함', '청량감', '깊은향', '무게감', '자연감', '시원함', '허브', '오션']
        return <div style={{
            display: "flex",
            flexWrap: "wrap",           // 여러 줄로 감싸기
            gap: "5px",                 // 버튼 간 간격
            justifyContent: "center",   // 가운데 정렬
            maxWidth: "530px",
            margin: "0 auto"
        }}>
            {tag.map((item, index) => (
                <button
                    key={index}
                    style={{
                        padding: '4px 10px',
                        backgroundColor: '#f3ecdfff',
                        borderRadius: '20px',
                        fontSize: '0.9em',
                        color: '#555',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        textAlign: "center"
                    }}
                    onClick={() => seachTag(item)}
                >
                    #{item}
                </button>
            ))}</div>
    }

    useEffect(() => {
        let filtered = product;

        // 1️⃣ 카테고리 + 태그 필터
        if (activeCategory === "type" && selectedTag) {
            filtered = filtered.filter((item) =>
                item.category?.toLowerCase().includes(selectedTag.toLowerCase())
            );
        } else if (activeCategory === "season" && selectedTag) {
            filtered = filtered.filter((item) =>
                item.season?.toLowerCase().includes(selectedTag.toLowerCase())
            );
        }

        // 2️⃣ 검색어 필터 (부분 일치 + 대소문자 무시)
        if (searchTerm?.trim() !== "") {
            filtered = filtered.filter((item) =>
                [item.name, item.season, item.keyword]
                    .some(field =>
                        field?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
            );
        }
        setFilteredProducts(filtered);
    }, [product, activeCategory, selectedTag, searchTerm]);

    const displayedProducts = filteredProducts.slice(0, visibleCount);

    const addToCart = async (e, product) => {
        e.stopPropagation();
        try {
            const url = `${API_BASE_URL}/cart/insert`;
            const parameters = {
                userId: user.id,
                productId: product,
                quantity: 1
            };

            const response = await axios.post(url, parameters, { withCredentials: true });

            alert(response.data);
        } catch (error) {
            console.log('오류 발생 : ' + error);

            if (error.response) {
                alert('장바구니 추가 실패');
                console.log(error.response.data);
            }
        }
    }


    return (<>

        <div style={{ textAlign: 'left', margin: '50px 0px 10px 50px', fontSize: '40px', fontFamily: "'Gowun Batang', serif", color: '#808080ff' }}>_Best Perfume<span style={{ fontSize: '20px' }}>__ Scentelier의 베스트 향수를 만나보세요.</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
                ref={containerRef}
                style={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    gap: '10px',
                    padding: '10px',
                    width: '90%',
                    whiteSpace: 'nowrap',

                    // 스크롤바 없애기
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
                className="no-scrollbar"
            >
                {extended.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: '0 0 auto',
                        }}
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
                                            whiteSpace: 'normal',   // 줄 바꿈 허용
                                            wordWrap: 'break-word', // 단어 단위로도 줄 바꿈 가능
                                            overflow: 'hidden',        // 넘치는 텍스트 숨기기
                                            textOverflow: 'ellipsis',  // 넘치는 텍스트에 "..." 표시
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
        {/* 베스트향수 / 상단  */}

        <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '65px', fontFamily: "'Gowun Batang', serif" }}>scentelier
        </div>

        <div className="d-flex justify-content-center" style={{
            marginTop: 10
        }} >
            <Form className="d-flex">
                <FormControl
                    type="text"
                    placeholder="Search"
                    className="mb-3"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setActiveCategory("all");
                    }}
                    style={{
                        padding: '6px 10px',
                        fontSize: '14px',
                        border: '1px solid #e0e0e0ff',
                        borderRadius: '4px 0 0 4px',
                        width: '400px',
                        height: '45px',
                        borderRadius: '5px 5px 5px 5px'
                    }}
                />
            </Form>
        </div>

        {tags()}
        {/* --------------------------------------카테고리 ------------------------------------ */}


        <div
            style={{
                display: 'flex',
                flexDirection: 'column', // 위아래 쌓기
                justifyContent: 'center',
                alignItems: 'center',
                margin: '70px',
            }}
        >
            <div style={{ display: 'flex', gap: '20px', marginLeft: '10px' }}>
                <div
                    onClick={() => toggleCategory("all")}
                    style={{
                        cursor: 'pointer',
                        fontSize: '30px',
                        fontWeight: activeCategory === "all" ? '700' : '500', // ALL 선택 시 bold
                        paddingBottom: '5px',
                        marginRight: '70px',
                    }}
                >
                    ALL
                </div>
                <div
                    onClick={() => toggleCategory('type')}
                    style={{
                        cursor: 'pointer',
                        fontSize: '30px',
                        fontWeight: activeCategory === 'type' ? '700' : '500',
                        paddingBottom: '30px',
                        marginRight: '70px',
                    }}
                >
                    TYPE
                </div>
                <div
                    onClick={() => toggleCategory('season')}
                    style={{
                        cursor: 'pointer',
                        fontSize: '30px',
                        fontWeight: activeCategory === 'season' ? '700' : '500',
                        paddingBottom: '5px',
                    }}
                >
                    SEASON
                </div>
            </div>

            {/* 하위 카테고리 태그 출력 */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {categoriesToShow.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => handleTagClick(tag, activeCategory)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: '1px solid #ccc',
                            backgroundColor: selectedTag === tag ? '#ddd' : '#f9f9f9',
                            cursor: 'pointer',
                            fontSize: '1rem',
                        }}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>



        {/* 상품 목록 */}

        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "left",
                gap: "40px",
                marginTop: "60px",
                padding: "0px 150px 0px 170px"
            }}
        >
            {displayedProducts.map((item, index) => (
                <Card
                    key={index}
                    style={{
                        flex: "0 1 25rem",     // 기본적으로 25rem 유지
                        maxWidth: "25rem",     // 최대 너비 제한
                        boxSizing: "border-box",

                    }}
                    onClick={() => navigate(`/product/detail/${item.id}`)}
                >
                    <Card.Img
                        variant="top"
                        src={`${API_BASE_URL}/uploads/products/${item.imageUrl}`}
                        style={{
                            width: "100%",
                            height: "300px",
                            objectFit: "cover",
                            borderRadius: "4px 4px 0 0",
                        }}
                    />
                    <Card.Body>
                        <Card.Title style={{ textAlign: "center" }}>
                            {item.name}
                        </Card.Title>
                        <Card.Text style={{ margin: "10px", textAlign: "center" }}>
                            <span style={{ fontSize: "1.3em", fontWeight: "bold" }}>
                                {item.price?.toLocaleString() ?? "38,000"}원
                            </span>
                            <br />
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                    marginTop: "20px",
                                    justifyContent: "center",
                                }}
                            >
                                {item.keyword
                                    ? item.keyword.split(",").map((tag, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                padding: "4px 10px",
                                                backgroundColor: "#ebebebff",
                                                borderRadius: "20px",
                                                fontSize: "0.85em",
                                                color: "#555",
                                                border: "1px solid transparent",
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))
                                    : null}
                            </div>
                        </Card.Text>
                        <Button
                            onClick={(e) => {
                                if (!user) {
                                    e.stopPropagation();

                                    alert('로그인이 필요한 서비스입니다.');
                                    navigate('/login');
                                    return; // 로그인 페이지로 이동 후 종료
                                }

                                // 로그인된 경우에만 장바구니 추가 실행
                                addToCart(e, item.id);
                            }}
                            style={{
                                backgroundColor: "transparent",
                                color: "#808080ff",
                                border: "2px solid hsla(0, 0%, 50%, 1.00)",
                                margin: "20px auto 0 auto",
                                display: "block",
                            }}
                        >
                            add to cart
                        </Button>
                    </Card.Body>
                </Card>
            ))}
        </div>



        {/* 향수찾기 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <Card style={{ width: '80rem', height: '24rem', margin: '55px', borderColor: '#dbdbdbff' }}>
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
                                " Still searching for
                            </h5>

                            <h5 style={{
                                fontSize: '40px',
                                fontWeight: 'bold',
                                color: '#67AB9F',
                                fontFamily: "'Gowun Batang', serif",
                                textAlign: 'right',           // 오른쪽 정렬
                                marginRight: '80px',          // 오른쪽 여백
                            }}>
                                your perfect fragrance? "
                            </h5>
                        </div>

                        {/* 설명 + 버튼 */}
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px', backgroundColor: "#f5f5f5ff", borderRadius: '5px', padding: '10px' }}>
                            <p style={{
                                paddingLeft: '30px',
                                fontSize: '22px',
                                color: '#808080ff',
                                textAlign: 'left',
                                lineHeight: 1.4,
                                flex: 1,
                                marginTop: '12px'
                            }}>
                                <strong>센텔리아와 함께 나만의 향을 찾아보세요.</strong><br /><br />
                                <span style={{ fontSize: '19px' }}>
                                    세상에 하나뿐인 나만의 맞춤 향수를 만들어,<br />
                                    특별한 나만의 이야기를 시작하세요 →
                                </span>
                            </p>

                            <button
                                onClick={() => navigate(`/perfume/finder`)}
                                style={{
                                    marginRight: '49px',
                                    padding: '10px 20px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    height: 'fit-content',
                                    backgroundColor: '#67AB9F',
                                    color: '#ffff',
                                    border: '2px solid #67AB9F',
                                    borderRadius: '5px',
                                    width: '150px'
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

export default Productlist;