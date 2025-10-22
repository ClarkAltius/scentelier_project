import { Form } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

function PerfumeBlending() {

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
                        <Form style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Form.Group style={{ width: "40%", marginBottom: "40px" }}>
                                <Form.Label>세상에 하나뿐인 향에 이름을 붙여보세요.</Form.Label>
                                <Form.Control type="text" placeholder="Name Your Scent" />

                                <Form.Label style={{ marginTop: "40px" }}>당신이 끌리는 무드는 어떤건가요?</Form.Label>
                                <Form.Select>
                                    <option>향기의 분위기를 선택해보세요.</option>
                                    <option value="1">Powdery</option>
                                    <option value="2">Chypre</option>
                                    <option value="3">Citrus</option>
                                    <option value="4">Crystal</option>
                                    <option value="5">Floral</option>
                                    <option value="6">Fruity</option>
                                    <option value="7">Green</option>
                                    <option value="8">Woody</option>
                                </Form.Select>

                                <Card className='mt-3'>
                                    <Card.Body style={{ display: "flex", justifyContent: "left", gap: '20px' }}>
                                        <div style={{ width: "150px" }}>
                                            <img
                                                src='/type/powder.jpg'
                                                style={{
                                                    width: "100%",
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '10px', marginTop: "10px" }}>
                                                ✨추천 조합
                                            </div>
                                            <div style={{ fontSize: '1.1rem', color: '#6B4C3B', textAlign: "left" }}>
                                                Top:<br />
                                                Middle:<br />
                                                Last:
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Form.Label style={{ marginTop: "40px" }}>Top. 가장 먼저 느껴지는 첫인상, 향의 시작</Form.Label>
                                <Form.Select>
                                    <option value="1"></option>
                                </Form.Select>
                                <Form.Label style={{ marginTop: "20px" }}>
                                    Intensity
                                </Form.Label>
                                <Form.Range />

                                <Card className='mt-3'>
                                    <Card.Body style={{ display: "flex", justifyContent: "left", gap: '20px' }}>
                                        <div style={{ width: "100%" }}>
                                            <img
                                                src='/type/powder.jpg'
                                                style={{
                                                    width: "100%",
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '10px', marginTop: "10px" }}>
                                                ✨추천 조합
                                            </div>
                                            <div style={{ fontSize: '1rem', color: '#6B4C3B', textAlign: "left" }}>
                                                갈바넘은 마치 새벽녘 깊은 숲속, 갓 꺾은 줄기에서 배어 나오는 진한 수액처럼, 쌉싸름하면서도 강렬한 풀 내음이 코끝을 날카롭게 스며들어요. 그 향은 혼돈스러운 마음에 명료한 긴장감을 부여하며 신비로운 여운을 남기죠.

                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Form.Label style={{ marginTop: "40px" }}>Middle. 향수의 중심, 진짜 매력을 보여주는 향</Form.Label>
                                <Form.Select>
                                    <option value="1">
                                    </option>
                                </Form.Select>
                                <Form.Label style={{ marginTop: "20px" }}>
                                    Intensity
                                </Form.Label>
                                <Form.Range />

                                <Form.Label style={{ marginTop: "40px" }}>Last. 마지막까지 잔잔히 남는 깊은 여운</Form.Label>
                                <Form.Select>
                                    <option value="1">
                                    </option>
                                </Form.Select>
                                <Form.Label style={{ marginTop: "20px" }}>
                                    Intensity
                                </Form.Label>
                                <Form.Range />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>용량을 선택하세요</Form.Label>
                                <div style={{ display: 'flex', gap: '50px', marginTop: "10px" }}>
                                    <Form.Check label="30ml" name="volume" type="radio" />
                                    <Form.Check label="50ml" name="volume" type="radio" />
                                    <Form.Check label="100ml" name="volume" type="radio" />
                                </div>
                            </Form.Group>
                        </Form>
                        <div style={{ margin: "50px", gap: "10px" }}>
                            <button style={{
                                marginRight: "30px", borderRadius: '3px',
                                backgroundColor: '#ffffffff',
                                border: '1px solid #808080ff',
                                color: '#808080ff',
                                width: "120px", height: "50px"
                            }}>저장하기</button>
                            <button style={{
                                marginRight: "30px", borderRadius: '3px',
                                backgroundColor: '#66594eff',
                                color: "white",
                                border: '1px solid transparent',
                                width: "120px", height: "50px"
                            }}>주문하기</button>
                        </div>
                    </div>



                </Card.Body>
            </Card>
        </div >
    </>
    );
}

export default PerfumeBlending;