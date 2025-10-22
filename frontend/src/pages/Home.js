import Carousel from 'react-bootstrap/Carousel';
import React, { useEffect, useRef, useState } from 'react';
import Card from 'react-bootstrap/Card';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';



function Home() {
    const [thumbnails, setThumbnails] = useState([]);
    const containerRef = useRef();

    // 썸네일 목록 - 3번 반복해 무한 루프 효과
    // const thumbnails = [
    //     { id: 1, src: '/type/Chypre.jpg', alt: '썸네일 1', label: '# Chypre' },
    //     { id: 2, src: '/type/Citrus.jpg', alt: '썸네일 2', label: '# Citrus' },
    //     { id: 3, src: '/type/Floral.jpg', alt: '썸네일 3', label: '# Floral' },
    //     { id: 4, src: '/type/Fruity.jpg', alt: '썸네일 4', label: '# Fruity' },
    //     { id: 5, src: '/type/Green.jpg', alt: '썸네일 5', label: '# Green' },
    //     { id: 6, src: '/type/Powder.jpg', alt: '썸네일 6', label: '# Powder' },
    //     { id: 7, src: '/type/Woody.jpg', alt: '썸네일 7', label: '# Woody' },
    //     { id: 8, src: '/type/Crystal.jpg', alt: '썸네일 8', label: 'Crystal' },
    // ];
    const extended = [...thumbnails, ...thumbnails, ...thumbnails];

    useEffect(() => {

        // console.log("useEffect 시작");
        // const url = `${API_BASE_URL}/homepage`;
        // axios
        //     .get(url)
        //     .than((response) => {
        //         console.log("응답 데이터:", response.data);
        //         setThumbnails(response.data)
        //     })
        //     .catch((error) => {
        //         console.error("에러 발생:", error);
        //     })


        //---------------------------------------------------------------------------- 
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

        return () => {
            clearInterval(scrollInterval);
            clearTimeout(scrollTimeout);
            container.removeEventListener('scroll', onScroll);
            container.removeEventListener('wheel', onWheel);
        };
    }, []);



    return (
        <>
            <Carousel>
                {/* {thumbnails.map((bean) => {
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={`${API_BASE_URL}/uploads/${bean}`}
                            alt={bean.name}
                            style={{ width: '300px', height: '800px', objectFit: 'cover' }}
                        />
                        <Carousel.Caption>
                            <h1>
                                <span style={{ fontSize: '70px' }}>"Scentelier</span>
                                <br />— Craft Your Signature Story."</h1>
                        </Carousel.Caption>
                    </Carousel.Item>

                })} */}












                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src="/ddd.jpg"
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
                        src="/ttt.jpg"
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
                        src="/rrr.jpg"
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

            <div className="d-flex justify-content-center" >
                <Card style={{ width: '25rem', margin: '60px 50px 60px 0px' }}>
                    <Card.Img variant="top" src={`${API_BASE_URL}/images/qqq.jpg`}
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
                </Card>

                {/* 카드하나 */}

                <Card style={{ width: '25rem', margin: '60px 50px 60px 0px' }}>
                    <Card.Img variant="top" src="/www.jpg"
                        style={{
                            width: '100%',
                            height: '300px',         // 원하는 높이 고정
                            objectFit: 'cover',      // 이미지 영역에 꽉 차게, 잘라서 맞춤
                            borderRadius: '4px 4px 0 0' // 카드 상단 모서리 둥글게 (선택사항)
                        }} />
                    <Card.Body>
                        <Card.Title>Berry Radiant</Card.Title>
                        <Card.Text style={{ textAlign: 'center', margin: '10px' }}>
                            <span style={{ fontSize: '1.3em', fontWeight: 'bold' }}>38,000</span>
                            <br />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '20px', justifyContent: 'center' }}>
                                {['#프루티', '#플로럴', '#달콤함'].map((tag, idx) => (
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
                </Card>
                <Card style={{ width: '25rem', margin: '60px 50px 60px 0px' }}>
                    <Card.Img variant="top" src="/www.jpg"
                        style={{
                            width: '100%',
                            height: '300px',         // 원하는 높이 고정
                            objectFit: 'cover',      // 이미지 영역에 꽉 차게, 잘라서 맞춤
                            borderRadius: '4px 4px 0 0' // 카드 상단 모서리 둥글게 (선택사항)
                        }} />
                    <Card.Body>
                        <Card.Title>Moss & Oak</Card.Title>
                        <Card.Text style={{ textAlign: 'center', margin: '10px' }}>
                            <span style={{ fontSize: '1.3em', fontWeight: 'bold' }}>38,000</span>
                            <br />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '20px', justifyContent: 'center' }}>
                                {['#시프레', '#우디', '가을향'].map((tag, idx) => (
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
                </Card>

            </div >
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
        </>
    );

}
export default Home;