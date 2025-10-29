import axios from 'axios';
import { useEffect, useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { API_BASE_URL } from '../config/config';
import { useAuth } from "../component/AuthContext";
import { useNavigate } from 'react-router-dom';


function PerfumeBlending() {
    const { user } = useAuth();

    const [selectedType, setSelectedType] = useState("");
    const [loading, setLoading] = useState(false);
    const [notesByType, setNotesByType] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const navigate = useNavigate();

    const MAX_TOTAL = 10;

    //향수이름
    const [perfumeName, setPerfumeName] = useState("");

    //선택 향료
    const [selectedTop, setSelectedTop] = useState("");
    const [selectedMiddle, setSelectedMiddle] = useState("");
    const [selectedLast, setSelectedLast] = useState("");

    //선택농도
    const [topValue, setTopValue] = useState(0);
    const [middleValue, setMiddleValue] = useState(0);
    const [lastValue, setLastValue] = useState(0);

    //선택 용량
    const [selectedVolume, setSelectedVolume] = useState("");




    const perfumeTypes = [
        "Powdery",
        "Woody",
        "Crystal",
        "Chypre",
        "Citrus",
        "Floral",
        "Fruity",
        "Green",
    ];

    useEffect(() => {
        const fetchIngredients = async () => {
            setLoading(true);
            try {
                const url = `${API_BASE_URL}/api/perfume/list`;
                const response = await axios.get(url);

                // name 기준 오름차순 정렬
                const sortedIngredients = response.data.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                setIngredients(sortedIngredients);
            } catch (error) {
                console.error("❌ 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIngredients();
    }, []);



    // 타입 선택 시
    const handleSelect = async (e) => {
        const type = e.target.value;
        setSelectedType(type);
        setLoading(true);
        try {
            console.log(`${type}`)
            const url = `${API_BASE_URL}/api/perfume/type?type=${type}`;
            const response = await axios.get(url);
            setNotesByType(response.data.reduce((acc, item) => {
                if (!acc[item.noteType]) acc[item.noteType] = [];
                acc[item.noteType].push(item);
                return acc;
            }, {}));

        } catch (error) {
            console.error("❌ 데이터 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (slider) => (e) => {
        let newValue = parseInt(e.target.value);

        let otherSum = 0;
        if (slider === "top") otherSum = middleValue + lastValue;
        if (slider === "middle") otherSum = topValue + lastValue;
        if (slider === "last") otherSum = topValue + middleValue;

        if (otherSum + newValue > MAX_TOTAL) {
            newValue = MAX_TOTAL - otherSum;
        }

        if (slider === "top") setTopValue(newValue);
        if (slider === "middle") setMiddleValue(newValue);
        if (slider === "last") setLastValue(newValue);
    };

    const handleVolumeChange = (e) => {
        setSelectedVolume(e.target.value); // 클릭된 라디오 버튼 값 저장
    };

    const handleNameChange = (e) => {
        setPerfumeName(e.target.value);
    };

    const payload = {
        ingredient: [
            { ingredientId: (selectedTop?.id), noteType: "TOP", amount: topValue },
            { ingredientId: (selectedMiddle?.id), noteType: "MIDDLE", amount: middleValue },
            { ingredientId: (selectedLast?.id), noteType: "LAST", amount: lastValue }
        ]
    };


    const createCustomPerfume = async () => {
        if (!selectedTop || !selectedMiddle || !selectedLast) {
            alert("모든 향료를 선택해주세요!");
            return
        }

        const total = topValue + middleValue + lastValue;

        if (total !== MAX_TOTAL) {
            alert(`향료의 비율이 ${MAX_TOTAL}이 되도록 맞춰주세요 (현재 : ${total})`);
            return; // 조건이 안 맞으면 함수 종료
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/customPerfume/addCustom`, {
                userId: user.id,
                name: perfumeName,
                volume: parseInt(selectedVolume),
                customPerfumeInfoDto: payload.ingredient
            });

            alert(`[${response.data.name}] 향수가 저장되었습니다.`);
            console.log(response.data);

            return response.data; // ← 향수 데이터를 반환
        } catch (error) {
            const msg = error.response?.data?.error || error.message;
            alert(msg);
            return null; // 실패 시 null 반환
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault(); // 클릭 이벤트 막기

        // 1. 커스텀 향수 생성
        const perfume = await createCustomPerfume();
        // console.log(perfume.id)
        if (!perfume) return; // 실패 시 장바구니 추가 안함

        // 2. 장바구니에 추가
        addToCart(perfume);
    };

    const addToCart = async (item) => {
        try {
            const url = `${API_BASE_URL}/cart/insert/custom`;
            const parameters = {
                userId: user.id,
                customId: item.id,
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

    const selectedIds = [
        selectedTop && selectedTop.id,
        selectedMiddle && selectedMiddle.id,
        selectedLast && selectedLast.id,
    ].filter(Boolean); // null/undefined 제거

    const renderSelect = (label, selected, setSelected) => (
        <>
            <Form.Select
                value={selected?.id || ""}
                onChange={(e) => {
                    const selectedId = e.target.value;
                    if (!selectedId) {
                        setSelected(null); // 선택 해제
                    } else {
                        const item = ingredients.find(i => i.id === parseInt(selectedId, 10));
                        setSelected(item || null); // 안전하게 null 처리
                    }
                }}
            >
                <option value="">선택하세요</option>
                {ingredients
                    ?.filter((item) => {
                        // 현재 선택된 항목은 남기고, 다른 곳에서 선택되지 않은 항목만 표시
                        return !selectedIds.includes(item.id) || (selected && item.id === selected.id);
                    })
                    .map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
            </Form.Select>
        </>
    );


    return (<>

        <div style={{ display: "flex", justifyContent: "center", margin: "50px" }}>
            <Card style={{ width: "80%", textAlign: "center" }}>
                <Card.Body>
                    <div style={{ margin: 30, textAlign: 'center', color: '#6B4C3B' }}>
                        <h2
                            style={{
                                fontFamily: "'Gowun Batang', serif",
                                fontSize: '1.8rem',
                                marginBottom: 10,
                                textShadow: '1px 1px 2px #cfc1af',
                            }}
                        >
                            Design Your Own Scent            </h2>
                        <p
                            style={{
                                fontFamily: "'Nanum Myeongjo', serif",
                                fontSize: '1.1rem',
                                color: '#8C7A6B',
                                opacity: 0.8,
                                margin: 0,
                            }}
                        >
                            당신의 취향, 기억, 무드를 담아
                            오직 당신만을 위한 향수를 만들어보세요.            </p>
                    </div>
                    <div>
                        <Form style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "100px" }}>
                            <Form.Group style={{ width: "40%", marginBottom: "40px", fontSize: "18px" }}>
                                <Form.Label><strong>1. 세상에 하나뿐인 향에 이름을 붙여보세요.</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Name Your Scent"
                                    value={perfumeName}
                                    onChange={handleNameChange} />

                                <Form.Label style={{ marginTop: "40px" }}>💗 당신이 끌리는 무드는 어떤건가요?</Form.Label>
                                <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                                    <Form.Select value={selectedType} onChange={handleSelect}>

                                        <option value="">당신의 무드에 어울리는 향료를 추천해드려요.</option>
                                        {perfumeTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </Form.Select>

                                </div>
                                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", width: "100%" }}>

                                    {selectedType && (
                                        <Card className="mt-3 shadow-sm" style={{
                                            width: "700px",     // 카드 폭 고정
                                            minWidth: "700px",  // 최소 폭도 700px로 고정
                                            maxWidth: "700px",  // 최대 폭도 700px로 고정
                                        }}>
                                            <Card.Body
                                                style={{
                                                    display: "flex",          // 수평 정렬
                                                    gap: "30px",              // 이미지와 텍스트 간격
                                                    alignItems: "center",
                                                    marginLeft: "40px"
                                                }}
                                            >
                                                {/* 이미지 영역 */}
                                                <div
                                                    style={{
                                                        width: "150px",
                                                        height: "200px",
                                                        overflow: "hidden",
                                                        borderRadius: "8px",
                                                        backgroundColor: "#f0f0f0",
                                                        flexShrink: 0,           // 이미지 영역 고정
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <img
                                                        src={`${API_BASE_URL}/uploads/type/${selectedType}.jpg`}
                                                        alt={selectedType || "향기 타입"}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </div>

                                                {/* 텍스트 영역 */}
                                                <div style={{
                                                    display: "flex", flexDirection: "column", width: "100%", margin: "10px 0px 0px 10px"
                                                }}>
                                                    <div
                                                        style={{
                                                            fontWeight: "bold",
                                                            fontSize: "1.1rem",
                                                            marginBottom: "10px",
                                                            textAlign: "left"
                                                        }}
                                                    >
                                                        ✨ 추천 조합
                                                    </div>

                                                    <div style={{ fontSize: "1rem", color: "#6B4C3B", textAlign: "left", width: "100%" }}>

                                                        <div>
                                                            <p>
                                                                <strong>Top:</strong><br /> {notesByType.TOP?.map(n => n.ingredientName).join(", ")}
                                                            </p>
                                                            <p>
                                                                <strong>Middle:</strong><br />{notesByType.MIDDLE?.map(n => n.ingredientName).join(", ")}
                                                            </p>
                                                            <p>
                                                                <strong>Last:</strong><br />{notesByType.LAST?.map(n => n.ingredientName).join(", ")}
                                                            </p>
                                                        </div>

                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>)}

                                    {!selectedType && (
                                        <p style={{ color: "#888", textAlign: "center" }}>  </p>
                                    )}
                                </div>

                                {/* --------------------추천조합 끝 ----------------------------------------------------*/}

                                <Form.Label style={{ marginTop: "40px", fontSize: "15px" }}>
                                    <span style={{ fontSize: "20px" }}><strong>TOP</strong></span>
                                    __향의 시작, 감각을 깨우는 첫 만남의 설렘
                                </Form.Label>
                                {renderSelect("TOP", selectedTop, setSelectedTop)}

                                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", width: "100%" }}>
                                    <Card className='mt-3' style={{
                                        width: "600px",     // 카드 폭 고정
                                        minWidth: "600px",  // 최소 폭도 700px로 고정
                                        maxWidth: "600px",
                                        paddingRight: "30px"
                                    }}>
                                        <Card.Body style={{
                                            display: "flex",
                                            justifyContent: "flex-start", // 왼쪽 정렬
                                            alignItems: "flex-start", // 위쪽 기준 정렬
                                            gap: "10px", // 이미지와 설명 간격 줄이기
                                            padding: "20px"
                                        }}>
                                            <div style={{ width: "150px", height: "150px", overflow: "hidden", borderRadius: "8px", flexShrink: 0 }}>
                                                <img
                                                    src={
                                                        selectedTop
                                                            ? `${API_BASE_URL}/uploads/ingredient/${selectedTop?.name}.jpg`
                                                            : `${API_BASE_URL}/uploads/ingredient/default.jpg` // 기본 이미지 경로
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        height: '150px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', width: "100%" }}>

                                                <div style={{
                                                    fontSize: '1rem', color: '#6B4C3B', textAlign: "left", margin: "30px 10px 0px 10px"
                                                }}>
                                                    {ingredients.find(i => i.name === (selectedTop?.name))?.description || "선택된 향료가 없습니다."}
                                                </div>

                                            </div>
                                        </Card.Body>
                                        <div style={{ width: "300px", margin: "30px auto" }}>
                                            <Form.Label>Intensity: {topValue}</Form.Label>
                                            <Form.Range className='custom-range'
                                                value={topValue} onChange={handleChange("top")} max={MAX_TOTAL}

                                            />
                                        </div>
                                    </Card>
                                </div>



                                <Form.Label style={{ marginTop: "100px", fontSize: "15px" }}>
                                    <span style={{ fontSize: "20px" }}><strong>MIDDLE</strong></span>
                                    __향수의 중심, 진짜 매력을 보여주는 향
                                </Form.Label>
                                {renderSelect("MIDDLE", selectedMiddle, setSelectedMiddle)}

                                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", width: "100%" }}>
                                    <Card className='mt-3' style={{
                                        width: "600px",     // 카드 폭 고정
                                        minWidth: "600px",  // 최소 폭도 700px로 고정
                                        maxWidth: "600px",
                                        paddingRight: "30px"
                                    }}>
                                        <Card.Body style={{
                                            display: "flex",
                                            justifyContent: "flex-start", // 왼쪽 정렬
                                            alignItems: "flex-start", // 위쪽 기준 정렬
                                            gap: "10px", // 이미지와 설명 간격 줄이기
                                            padding: "20px"
                                        }}>
                                            <div style={{ width: "150px", height: "150px", overflow: "hidden", borderRadius: "8px", flexShrink: 0 }}>
                                                <img
                                                    src={
                                                        selectedMiddle
                                                            ? `${API_BASE_URL}/uploads/ingredient/${selectedMiddle?.name}.jpg`
                                                            : `${API_BASE_URL}/uploads/ingredient/default.jpg` // 기본 이미지 경로
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        height: '150px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', width: "100%" }}>

                                                <div style={{ fontSize: '1rem', color: '#6B4C3B', textAlign: "left", margin: "30px 10px 0px 10px" }}>
                                                    {ingredients.find(i => i.name === selectedMiddle?.name)?.description || "선택된 향료가 없습니다."}
                                                </div>

                                            </div>
                                        </Card.Body>
                                        <div style={{ width: "300px", margin: "30px auto" }}>
                                            <Form.Label>Intensity: {middleValue}</Form.Label>
                                            <Form.Range className='custom-range'
                                                value={middleValue} onChange={handleChange("middle")} max={MAX_TOTAL}
                                            />
                                        </div>
                                    </Card>
                                </div>

                                <Form.Label style={{ marginTop: "100px", fontSize: "15px" }}>
                                    <span style={{ fontSize: "20px" }}><strong>LAST</strong></span>
                                    __마지막까지 잔잔히 남는 깊은 여운
                                </Form.Label>
                                {renderSelect("LAST", selectedLast, setSelectedLast)}

                                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", width: "100%" }}>
                                    <Card className='mt-3' style={{
                                        width: "600px",     // 카드 폭 고정
                                        minWidth: "600px",  // 최소 폭도 700px로 고정
                                        maxWidth: "600px"
                                    }}>
                                        <Card.Body style={{ display: "flex", justifyContent: "left", gap: '20px' }}>
                                            <div style={{ width: "150px", height: "150px", overflow: "hidden", borderRadius: "8px", flexShrink: 0 }}>
                                                <img
                                                    src={
                                                        selectedLast
                                                            ? `${API_BASE_URL}/uploads/ingredient/${selectedLast?.name}.jpg`
                                                            : `${API_BASE_URL}/uploads/ingredient/default.jpg` // 기본 이미지 경로
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        height: '150px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', width: "100%" }}>

                                                <div style={{ fontSize: '1rem', color: '#6B4C3B', textAlign: "left", margin: "30px 10px 0px 10px" }}>
                                                    {ingredients.find(i => i.name === selectedLast?.name)?.description || "선택된 향료가 없습니다."}
                                                </div>

                                            </div>
                                        </Card.Body>
                                        <div style={{ width: "300px", margin: "30px auto" }}>
                                            <Form.Label>Intensity: {lastValue}</Form.Label>
                                            <Form.Range className='custom-range'
                                                value={lastValue} onChange={handleChange("last")} max={MAX_TOTAL}
                                            />
                                        </div>
                                    </Card>
                                </div>

                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    maxWidth: "600px",
                                    marginTop: "70px",
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                    gap: "20px"
                                }}>
                                    {/* TOP */}
                                    <div style={{ textAlign: "center", flex: 1 }}>
                                        <p style={{ fontSize: "12px", color: "#888", margin: "0 0 5px 0" }}>TOP</p>
                                        <p style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
                                            {selectedTop?.name || "없음"}<br /><span style={{ fontWeight: "400", color: "#555" }}>({topValue})</span>
                                        </p>
                                    </div>

                                    {/* MIDDLE */}
                                    <div style={{ textAlign: "center", flex: 1 }}>
                                        <p style={{ fontSize: "12px", color: "#888", margin: "0 0 5px 0" }}>MIDDLE</p>
                                        <p style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
                                            {selectedMiddle?.name || "없음"}<br /><span style={{ fontWeight: "400", color: "#555" }}>({middleValue})</span>
                                        </p>
                                    </div>

                                    {/* LAST */}
                                    <div style={{ textAlign: "center", flex: 1 }}>
                                        <p style={{ fontSize: "12px", color: "#888", margin: "0 0 5px 0" }}>LAST</p>
                                        <p style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
                                            {selectedLast?.name || "없음"}<br /><span style={{ fontWeight: "400", color: "#555" }}>({lastValue})</span>
                                        </p>
                                    </div>
                                </div>



                                <div
                                    className={`ratio-message ${topValue + middleValue + lastValue === MAX_TOTAL ? "success" : "warning"
                                        }`}
                                >
                                    {topValue + middleValue + lastValue === MAX_TOTAL
                                        ? "💚 완벽한 비율이에요!"
                                        : "향료의 비율이 10이 되도록 맞춰주세요."}
                                </div>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label ><strong>5. 용량을 선택하세요</strong></Form.Label>
                                <div style={{ display: 'flex', gap: '50px', marginTop: "10px" }}>
                                    <Form.Check label="30ml"
                                        name="volume"
                                        type="radio"
                                        value="30"
                                        checked={selectedVolume === "30"}
                                        onChange={handleVolumeChange} />
                                    <Form.Check label="50ml"
                                        name="volume"
                                        type="radio"
                                        value="50"
                                        checked={selectedVolume === "50"}
                                        onChange={handleVolumeChange} />
                                    <Form.Check label="100ml"
                                        name="volume"
                                        type="radio"
                                        value="100"
                                        checked={selectedVolume === "100"}
                                        onChange={handleVolumeChange} />
                                </div>
                            </Form.Group>
                        </Form>


                        <div style={{ margin: "50px", gap: "10px" }}>
                            <button
                                style={{
                                    marginRight: "30px", borderRadius: '3px',
                                    backgroundColor: '#ffffffff',
                                    border: '1px solid #808080ff',
                                    color: '#808080ff',
                                    width: "120px", height: "50px"
                                }}
                                onClick={createCustomPerfume}

                            >save</button>
                            <button
                                onClick={handleAddToCart}
                                style={{
                                    marginRight: "30px", borderRadius: '3px',
                                    backgroundColor: '#66594eff',
                                    color: "white",
                                    border: '1px solid transparent',
                                    width: "120px", height: "50px"
                                }}>add to cart</button>
                        </div>
                    </div>



                </Card.Body>
            </Card>
        </div >
    </>
    );
}

export default PerfumeBlending;