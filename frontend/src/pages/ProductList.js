import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Form, FormControl } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

function Productlist() {
    const containerRef = useRef();
    const [extended, setExtended] = useState([]);
    const [best, setBest] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();


    // 썸네일 목록 - 3번 반복해 무한 루프 효과


    useEffect(() => {
        const container = containerRef.current;

        const url = `${API_BASE_URL}/order/list2`
        axios.get(url)
            .then((response) => {
                console.log("응답받은 데이터 :");
                console.log(response.data);
                setBest(response.data);
                setExtended([...response.data, ...response.data, ...response.data]);
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


    // --------------------------------------------------------------------------------

    const handleSubmit = (e) => {//검색
        e.preventDefault();
        alert(searchTerm + "검색하기");
    }

    const seachTag = (tag) => {
        setSearchTerm(tag);
        alert(tag + "태그검색~")
    }

    const tags = () => {
        return best.slice(0, 2).map((item, index) => {
            const tags = item.keyword.split(',');
            return (
                <div key={index}>
                    {tags.map((tag, j) => (
                        <button
                            key={j}
                            style={{
                                margin: "5px",
                                padding: '4px 10px',
                                backgroundColor: '#ebebebff',
                                borderRadius: '20px',
                                fontSize: '0.9em',
                                color: '#555',
                                border: '1px solid transparent',
                                cursor: 'pointer'
                            }}
                            onClick={() => seachTag(tag)}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            );
        })
    }


    const types = ['Powdery', 'Woody', 'Crystal', 'Chypre', 'Citrus', 'Fruity', 'Green'];
    const seasons = ['SPRING', 'SUMMER', 'FALL', 'WINTER'];

    const [activeCategory, setActiveCategory] = useState(null); // 'type' | 'season' | null
    const [selectedTag, setSelectedTag] = useState(null);

    const toggleCategory = (category) => {
        if (category === '') { // ALL 버튼 클릭 시
            setActiveCategory(null);
            setSelectedTag(null);
        } else if (activeCategory === category) {
            setActiveCategory(null);
            setSelectedTag(null);
        } else {
            setActiveCategory(category);
            setSelectedTag(null);
        }
    };

    const handleTagClick = (tag) => {
        setSelectedTag(tag);
    };

    const categoriesToShow = activeCategory === 'type' ? types
        : activeCategory === 'season' ? seasons
            : [];


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
                            <Card style={{ width: '18rem', marginRight: "20px" }}>
                                <Card.Img variant="top" src={`${API_BASE_URL}/uploads/products/${item.imageUrl}`}
                                    style={{
                                        width: '100%',
                                        height: '250px',         // 원하는 높이 고정
                                        objectFit: 'cover',      // 이미지 영역에 꽉 차게, 잘라서 맞춤
                                        borderRadius: '4px 4px 0 0' // 카드 상단 모서리 둥글게 (선택사항)
                                    }} />
                                <Card.Body>
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text style={{ margin: '10px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '1.3em', fontWeight: 'bold' }}>38,000</span>
                                        <br />
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '6px',
                                                marginTop: '20px',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {(item.keyword || '')
                                                .split(',')
                                                .map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        style={{
                                                            padding: '4px 10px',
                                                            backgroundColor: '#ebebebff',
                                                            borderRadius: '20px',
                                                            fontSize: '0.72em',
                                                            color: '#555',
                                                            border: '1px solid transparent',
                                                        }}
                                                    >
                                                        #{tag.trim()}
                                                    </span>
                                                ))}
                                        </div>
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
            <Form className="d-flex" onSubmit={handleSubmit}>
                <FormControl
                    type="text"
                    placeholder="Search"
                    className="mb-3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#e0e0e0ff', // 원하는 색상
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px 4px 4px 4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        height: '45px',
                    }}
                >
                    검색
                </button>
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
                    onClick={() => toggleCategory('')}
                    style={{
                        cursor: 'pointer',
                        fontSize: '30px',
                        fontWeight: activeCategory === null ? '700' : '500', // ALL 선택 시 bold
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
                        onClick={() => handleTagClick(tag)}
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


        {/* 예시 상품*/}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Card style={{ width: '25rem', margin: '60px 50px 60px 0px' }}>
                <Card.Img variant="top" src="/www.jpg"
                    style={{
                        width: '100%',
                        height: '300px',         // 원하는 높이 고정
                        objectFit: 'cover',      // 이미지 영역에 꽉 차게, 잘라서 맞춤
                        borderRadius: '4px 4px 0 0' // 카드 상단 모서리 둥글게 (선택사항)
                    }} />
                <Card.Body>
                    <Card.Title>Powder Whisper</Card.Title>
                    <Card.Text style={{ margin: '10px', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.3em', fontWeight: 'bold' }}>38,000</span>
                        <br />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '20px', justifyContent: 'center' }}>
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
                    </Card.Text>
                    <Button style={{ backgroundColor: 'transparent', color: '#808080ff', border: '2px solid hsla(0, 0%, 50%, 1.00)', margin: '20px' }}>add to cart</Button>
                </Card.Body>
            </Card></div>

        <button
            style={{
                marginRight: '5px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                height: 'fit-content',
                backgroundColor: 'transparent',   // 배경 투명
                color: '#808080ff',                  // 텍스트 노란색
                border: '2px solid #808080ff',       // 테두리 노란색
                borderRadius: '5px',
            }}>
            View All
        </button>

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