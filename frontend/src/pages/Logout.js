import axios from "axios";
import { useState } from "react";
import { Container, Row, Col, Card, Alert, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
function Login({ setUser }) {
    // setUser : 사용자 정보를 저장하기 위한 setter 메소드

    // 로그인 관련 state 정의
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 오류 메시지 관련 state 정의
    const [errors, setErrors] = useState('');

    const navigate = useNavigate();

    const LoginAction = async (event) => { // 로그인과 관련된 이벤트 처리 함수
        event.preventDefault();
        let errStack = 0;
        try {
            const url = `${API_BASE_URL}/login`;
            const parameters = { email, password };

            // 스프링 부트가 넘겨 주는 정보는 Map<String, Object> 타입입니다.
            const response = await axios.post(url, parameters);

            // message에는 '로그인 성공 여부'를 알리는 내용, member에는 로그인 한 사람의 객체 정보가 반환 됩니다.
            const { message, member } = response.data;

            if (message === 'success') { // 자바에서 맵.put("message", "success") 식으로 코딩을 했습니다.
                console.log('로그인 한 사람의 정보');
                console.log(member);

                // 로그인 성공시 사용자 정보를 어딘가에 저장해야 합니다.  
                setUser(member);

                navigate(`/`); // 로그인 성공 후 홈 페이지로 이동

            } else { // 로그인 실패
                setErrors(message);
                errStack++;
            }
            if (errStack >= 5) {
                alert('비밀번호를 5회 이상 틀리셨습니다. 비밀번호 찾기를 권장드립니다.')
            }
        } catch (error) {
            if (error.response) {
                setErrors(error.response.data.message || '로그인 실패');

            } else {
                setErrors('이메일과 비밀번호를 다시 입력해 주세요');
            }
        }
    }

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
            <Row className="w-100 justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h2 style={{
                                fontSize: "54px",
                                fontFamily: "'Gowun Batang', serif",
                                color: "#67AB9F",
                            }} className="text-center mb-4">Login</h2>





                            {errors && <Alert variant="danger">{errors}</Alert>}

                            <Form onSubmit={LoginAction}>
                                <Form.Group className="mb-3">
                                    <Form.Label>이메일</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="이메일을 입력해 주세요."
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>비밀 번호</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="비밀 번호를 입력해 주세요."
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Row className="g-2">
                                    <Col xs={8}>
                                        <Button variant="outline-success" type="submit" className="w-100" size="lg"
                                            style={{ minWidth: 220, borderRadius: 0, fontWeight: 600 }}>
                                            로그인
                                        </Button>
                                    </Col>
                                    <Col xs={4}>
                                        <Link to={`/signup`} variant="outline-dark" size="100" style={{ minWidth: 100, borderRadius: 0, fontWeight: 600 }} className="btn btn-outline-secondary w-100">
                                            회원 가입

                                        </Link>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Link to={`/findpass`}>
                                            <div class="form-end">
                                                <a class="inline-link" href="$">비밀번호를 잊으셨나요?</a>
                                            </div>
                                        </Link>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}


export default Login;