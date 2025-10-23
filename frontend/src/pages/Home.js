import Carousel from 'react-bootstrap/Carousel';
import React, { useEffect, useRef, useState } from 'react';
import Card from 'react-bootstrap/Card';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import { useNavigate } from 'react-router-dom';



function Home() {
    const containerRef = useRef();
    const [best, setBest] = useState([]);
    const navigator = useNavigate();


    //썸네일 목록 - 3번 반복해 무한 루프 효과
    const thumbnails = [
        { id: 1, src: `${API_BASE_URL}/uploads/type/Chypre.jpg`, alt: '썸네일 1', label: '# Chypre' },
        { id: 2, src: `${API_BASE_URL}/uploads/type/Citrus.jpg`, alt: 'Citrus', label: '# Citrus' },
        { id: 3, src: `${API_BASE_URL}/uploads/type/Floral.jpg`, alt: 'Floral', label: '# Floral' },
        { id: 4, src: `${API_BASE_URL}/uploads/type/Fruity.jpg`, alt: 'Fruity', label: '# Fruity' },
        { id: 5, src: `${API_BASE_URL}/uploads/type/Green.jpg`, alt: 'Green', label: '# Green' },
        { id: 6, src: `${API_BASE_URL}/uploads/type/Powdery.jpg`, alt: 'Powdery', label: '# Powdery' },
        { id: 7, src: `${API_BASE_URL}/uploads/type/Woody.jpg`, alt: 'Woody', label: '# Woody' },
        { id: 8, src: `${API_BASE_URL}/uploads/type/Crystal.jpg`, alt: 'Crystal', label: '# Crystal' }
    ];
    const extended = [...thumbnails, ...thumbnails, ...thumbnails];

    useEffect(() => {

        const container = containerRef.current;
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

        const url = `${API_BASE_URL}/order/list`
        axios.get(url)
            .then((response) => {
                console.log("응답받은 데이터 :");
                console.log(response.data);
                setBest(response.data);
            })
            .catch(error => {
                console.error('데이터 가져오기 실패:', error);
            })

        return () => {
            clearInterval(scrollInterval);
            clearTimeout(scrollTimeout);
            container.removeEventListener('scroll', onScroll);
            container.removeEventListener('wheel', onWheel);
        };



    }, []);

    // ------------------------ 베스트 향수 ------------------------------------




    return (
        <>
            <Carousel>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={`${API_BASE_URL}/uploads/bigs/bigs1.jpg`}
                        alt="First slide"
                        style={{ width: '300px', height: '800px', objectFit: 'cover' }}
                    />
                    <Carousel.Caption className="top-left">
                        <h1>
                            <span style={{ fontSize: '70px' }}>"Scentelier</span>
                            <br />— Craft Your Signature Story."</h1>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={`${API_BASE_URL}/uploads/bigs/bigs2.jpg`}
                        alt="First slide"
                        style={{ width: '300px', height: '800px', objectFit: 'cover' }}
                    />
                    <Carousel.Caption className="top-left">
                        <h1>
                            <span style={{ fontSize: '70px' }}>"Scentelier</span>
                            <br />— Craft Your Signature Story."</h1>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={`${API_BASE_URL}/uploads/bigs/bigs3.jpg`}
                        alt="First slide"
                        style={{ width: '300px', height: '800px', objectFit: 'cover' }}
                    />
                    <Carousel.Caption className="top-left" >
                        <h1>
                            <span style={{ fontSize: '70px' }}>"Scentelier</span>
                            <br />— Craft Your Signature Story."</h1>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>

            {/* 메인사진 끝------------------------------------------ */}
            <div style={{ margin: '100px 0px 50px 0px', fontSize: '50px', fontFamily: "'Gowun Batang', serif", color: '#808080ff' }}># TYPE<span style={{ fontSize: '20px' }}>__ 원하는 향의 타입을 선택해보세요.</span></div>
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
                    {extended.map((thumb, idx) => (
                        <div
                            key={`${thumb.id}-${idx}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: '0 0 auto',
                            }}
                        >
                            <img
                                src={thumb.src}
                                alt={thumb.alt}
                                style={{
                                    width: 300,
                                    height: 400,
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    border: '2px solid transparent',
                                }}
                            />
                            <span
                                style={{
                                    marginTop: 15,
                                    fontSize: '30px',
                                    color: '#ff9a9aff',
                                    textAlign: 'center',
                                }}
                            >
                                {thumb.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 스크롤 끝------------------------------------------ */}

            <div className="d-flex justify-content-center" style={{ marginTop: '30px' }}>
                <Card style={{ width: '80rem', height: '24rem', margin: '55px', borderColor: '#dbdbdbff' }}>
                    <Card.Body style={{
                        display: 'flex'
                    }}>
                        < img
                            src={`${API_BASE_URL}/uploads/bigs/4.jpg`}
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
                        <div style={{ margin: '10px 0px 0px 22px' }}>
                            <h5 style={{ marginLeft: '40px', marginTop: '40px', fontSize: '40px', fontWeight: 'bold', color: '#67AB9F', fontFamily: "'Gowun Batang',serif" }}>
                                “What scent is the perfect fit for me?”
                            </h5>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <p
                                    style={{
                                        paddingLeft: '80px',
                                        paddingTop: '23px',
                                        fontSize: '22px',
                                        color: '#808080ff',
                                        textAlign: 'left',
                                        lineHeight: 1.4,
                                        flex: 1
                                    }}>
                                    <strong>몇 가지 질문만으로,<br />
                                        Scentelier가 당신의 성향과 감정에<br />
                                        어울리는 향기를 제안합니다.</strong><br /><br />
                                    <span style={{ fontSize: '19px', }}>나를 표현하는 단 하나의 향, 지금 바로 발견해보세요.</span>
                                </p>
                                <button
                                    style={{
                                        marginRight: '5px',
                                        padding: '10px 20px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        height: 'fit-content',
                                        backgroundColor: 'transparent',   // 배경 투명
                                        color: '#67AB9F',                  // 텍스트 노란색
                                        border: '2px solid #67AB9F',       // 테두리 노란색
                                        borderRadius: '5px',
                                    }}>
                                    TEST NOW
                                </button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div >

            {/* 테스트카드 끝------------------------------------------ */}

            <div style={{ textAlign: 'center', margin: '50px 0px 10px 50px', fontSize: '50px', fontFamily: "'Gowun Batang', serif", color: '#808080ff' }}>_Best Perfume<span style={{ fontSize: '20px' }}>__ Scentelier의 베스트 향수를 만나보세요.</span>
            </div>
            {/* -----------------------------리스트 ---------------------------- */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: "center" }}>
                {best.map((item) => {
                    return (<Card style={{ width: '25rem', margin: '60px 50px 60px 0px' }}>
                        <Card.Img variant="top" src={`${API_BASE_URL}/uploads/products/${item.imageUrl}`}
                            style={{
                                width: '100%',
                                height: '300px',         // 원하는 높이 고정
                                objectFit: 'cover',      // 이미지 영역에 꽉 차게, 잘라서 맞춤
                                borderRadius: '4px 4px 0 0' // 카드 상단 모서리 둥글게 (선택사항)
                            }} />
                        <Card.Body>
                            <Card.Title>{item.name}</Card.Title>
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
                    </Card>)
                })}
            </div>
            {/* -----------------------------리스트 ---------------------------- */}

            <button
                onClick={() => navigator(`/product/list`)}
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
                }}
            >
                View All
            </button>
        </>
    );

}
export default Home;