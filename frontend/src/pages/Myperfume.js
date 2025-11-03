// src/MyPerfume.jsx
import React, { useState, useEffect } from 'react';
import '../App.css'; // CSS 파일을 불러옵니다.
import { Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../component/AuthContext';
import { API_BASE_URL } from '../config/config';
import { useNavigate } from 'react-router-dom';

const MyPerfume = () => {
    const { user } = useAuth();

    const [perfumes, setPerfumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 카드 보이기/숨기기 상태 관리
    const [openCard, setOpenCard] = useState(null); // { id, noteType }
    const [filteredNotesByPerfume, setFilteredNotesByPerfume] = useState({}); // { [customId]: [...] }

    const handleLayerClick = (noteType, id) => {
        console.log("Clicked customId:", id);

        // 🔹 같은 향수 + 같은 노트 클릭 시 닫기
        if (openCard?.id === id && openCard?.noteType === noteType) {
            setOpenCard(null);
            return;
        }

        // 🔹 현재 열려있는 카드 정보 저장
        setOpenCard({ id, noteType });

        // 🔹 해당 향수 하나 선택
        const perfume = perfumes.find(item => item.customId === id);
        if (!perfume) return;

        console.log("Clicked perfume:", perfume);

        const ingredients = perfume.ingredients || [];
        console.log("Ingredients:", ingredients);

        // 🔹 선택한 노트 타입 필터링
        const filtered = ingredients.filter(item => item.noteType === noteType);
        console.log("Filtered Ingredients:", filtered);


        // 향수별 노트 저장
        setFilteredNotesByPerfume(prev => ({ ...prev, [id]: filtered }));
    };




    useEffect(() => {
        const fetchPerfumes = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/customPerfume/myPerfume/${user.id}`);
                console.log(response.data)
                setPerfumes(response.data);  // 응답 데이터로 perfumes 상태 업데이트
                setLoading(false);  // 로딩 완료
            } catch (err) {
                setError("Failed to fetch data");
                setLoading(false);
            }
        };

        fetchPerfumes();  // 데이터를 가져오는 함수 호출
    }, [user.id]);  // userId가 변경될 때마다 데이터를 다시 가져옴

    const [layerHeightsByPerfume, setLayerHeightsByPerfume] = useState({});

    // ❗ 기존 useEffect를 이 코드로 교체해주세요.

    useEffect(() => {
        // 향수 데이터가 없으면 실행하지 않음
        if (perfumes.length === 0) return;

        // 1. 모든 향수의 최종 높이를 미리 계산
        const targetHeights = {};
        perfumes.forEach(perfume => {
            const ingredients = perfume.ingredients || [];
            const topNoteAmount = ingredients.filter(i => i.noteType === "TOP").reduce((sum, i) => sum + i.amount, 0);
            const middleNoteAmount = ingredients.filter(i => i.noteType === "MIDDLE").reduce((sum, i) => sum + i.amount, 0);
            const lastNoteAmount = ingredients.filter(i => i.noteType === "LAST").reduce((sum, i) => sum + i.amount, 0);
            const total = topNoteAmount + middleNoteAmount + lastNoteAmount;

            targetHeights[perfume.customId] = {
                top: total > 0 ? (topNoteAmount / total) * 100 : 0,
                middle: total > 0 ? (middleNoteAmount / total) * 100 : 0,
                last: total > 0 ? (lastNoteAmount / total) * 100 : 0,
            };
        });

        // 2. 애니메이션을 시작하기 위해 아주 잠깐의 딜레이 후 목표 높이로 상태를 업데이트
        //    (이렇게 해야 0에서부터 채워지는 애니메이션이 보입니다)
        const animationTimer = setTimeout(() => {
            setLayerHeightsByPerfume(targetHeights);
        }, 100); // 0.1초 후에 애니메이션 시작

        // 3. 컴포넌트가 사라질 때 타이머 정리
        return () => clearTimeout(animationTimer);

    }, [perfumes]); // perfumes 데이터가 로드되면 한 번만 실행


    const navigate = useNavigate();

    const addToCart = async () => {
        try {
            const url = `${API_BASE_URL}/cart/insert/custom`;
            const parameters = {
                userId: user.id,
                customId: openCard.id,
                quantity: 1
            };

            const response = await axios.post(url, parameters, { withCredentials: true });
            alert(response.data);
            navigate('/cart/list');
        } catch (error) {
            console.log('오류 발생 : ' + error);

            if (error.response) {
                alert('장바구니 추가 실패');
            }
        }
    };

    const customDelete = async () => {
        try {
            const url = `${API_BASE_URL}/api/customPerfume/delete`;
            const parameters = {
                userId: user.id,
                customId: openCard.id,
            };

            const response = await axios.post(url, parameters, { withCredentials: true });
            alert(response.data);

            setPerfumes(prev => prev.filter(perfume => perfume.customId !== openCard.id));
            setOpenCard(null);

        } catch (error) {
            console.log('오류 발생 : ' + error);

            if (error.response) {
                alert('삭제 실패');
            }
        }
    }


    return (
        <>
            <h1 style={{
                marginTop: "50px",
                fontFamily: "'Gowun Batang', serif",
                color: "#7c5745ff"
            }}>My Signature Perfume Collection</h1>

            <div
                style={{
                    display: "flex",
                    flexDirection: "row",   // 가로 정렬
                    justifyContent: "center", // 가운데 정렬 (선택)
                    alignItems: "flex-start", // 카드 위쪽 맞춤
                    flexWrap: "wrap",         // 넘치면 다음 줄로
                    gap: "20px",              // 카드 간격
                    marginTop: "40px"
                }}
            >
                {perfumes.map((item) => {
                    const isOpen = openCard?.id === item.customId;
                    const filteredNotes = filteredNotesByPerfume[item.customId] || [];

                    const layerHeights = layerHeightsByPerfume[item.customId] || {
                        top: 0,
                        middle: 0,
                        last: 0,
                    };

                    return (
                        <Card
                            key={item.customId}
                            style={{
                                width: '500px',
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                padding: "10px",
                                marginTop: "30px"
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#ffffffff", // 연한 노란색
                                    color: "#808080ff",              // 글씨색
                                    fontWeight: "700",
                                    fontSize: "16px",           // 글씨 크게
                                    padding: "10px 25px",       // 패딩 크게
                                    borderRadius: "25px",       // 둥글기
                                    boxShadow: "0 3px 8px rgba(97, 97, 97, 0.25)", // 그림자도 조금 더 진하게
                                    position: "absolute",
                                    top: "-25px",               // 카드 위쪽에 더 띄움
                                    zIndex: 10,
                                    minWidth: "120px",          // 최소 너비
                                    textAlign: "center",        // 중앙 정렬
                                }}

                            >
                                {item.perfumeName}
                            </div>
                            <div className="perfume-bottle">
                                <div
                                    className="layer top-note-layer"
                                    style={{ height: `${layerHeights.top}%` }}
                                    onClick={() => handleLayerClick('TOP', item.customId)}
                                > <h3>{`${layerHeights.top}%`}</h3></div>

                                <div
                                    className="layer middle-note-layer"
                                    style={{ height: `${layerHeights.middle}%` }}
                                    onClick={() => handleLayerClick('MIDDLE', item.customId)}
                                > <h3>{`${layerHeights.middle}%`}</h3></div>
                                <div
                                    className="layer last-note-layer"
                                    style={{ height: `${layerHeights.last}%` }}
                                    onClick={() => handleLayerClick('LAST', item.customId)}
                                > <h3>{`${layerHeights.last}%`}</h3></div>
                            </div>

                            {isOpen && filteredNotes.length > 0 && (
                                <div>
                                    <div
                                        style={{
                                            fontFamily: "'Gowun Batang', serif", backgroundColor: "#f5f5f5ff",
                                            border: "2px solid #e9e9e9ff",
                                            color: "#afafafff",
                                            fontWeight: "700",
                                            fontSize: "14px",
                                            padding: "10px",
                                            borderRadius: "5px",
                                            minWidth: "50px",
                                            textAlign: "center",
                                            margin: "20px"
                                        }}
                                    >{openCard.noteType}</div>
                                    {filteredNotes.map((note, i) => (
                                        <div
                                            style={{ fontSize: "23px", color: "#6b6b6bff", marginBottom: 30 }}
                                            key={i}>
                                            {note.ingredientName}<br></br>
                                            <button
                                                onClick={addToCart}
                                                style={{
                                                    fontSize: "15px",
                                                    borderRadius: '3px',
                                                    color: "#8f8f8fff",
                                                    backgroundColor: "white",
                                                    border: '1px solid #bbbbbbff',
                                                    width: "100px", height: "40px",
                                                    marginTop: "30px"
                                                }}>add to cart</button>
                                            <button
                                                onClick={customDelete}
                                                style={{
                                                    fontSize: "15px",
                                                    borderRadius: '3px',
                                                    color: "#ffffffff",
                                                    backgroundColor: "#ffd1c8ff",
                                                    border: "transparent",
                                                    width: "60px", height: "40px",
                                                    marginTop: "30px",
                                                    marginLeft: "10px"
                                                }}>delete</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </>
    );

};

export default MyPerfume;

