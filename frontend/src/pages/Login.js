import axios from "axios";
import { useState } from "react";
import { Container, Row, Col, Card, Alert, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import { useAuth } from "../component/AuthContext.js"; //useAuth 훅 가져오기

function Login() {
    // setUser : 사용자 정보를 저장하기 위한 setter 메소드
    // 전일환: 로그인 기능 외부로 빼와서 setter 메소드 삭제

    const { login } = useAuth(); //콘텍스트에서 정의 한 로그인 기능 사용

    // 로그인 관련 state 정의
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 오류 메시지 관련 state 정의
    const [errors, setErrors] = useState('');

    const navigate = useNavigate();

    const LoginAction = async (event) => { // 로그인과 관련된 이벤트 처리 함수
        event.preventDefault();

        try {
            const url = `${API_BASE_URL}/member/login`;

            // 전일환 : x-www-form-urlencoded 사용을 위해 URLSearchParams로 변경
            const params = new URLSearchParams();
            params.append('email', email);
            params.append('password', password);


            // 전일환 : withCredentials 추가
            const response = await axios.post(url, params, { withCredentials: true });


            const { message, member } = response.data;

            if (message === 'success') {
                // console.log('로그인 한 사람의 정보');
                // console.log(member);


                login(member);

                navigate(`/`); // 로그인 성공 후 홈 페이지로 이동

            } else { // 로그인 실패
                setErrors(message);
            }

        } catch (error) {
            if (error.response) {
                setErrors(error.response.data.message || '로그인 실패');

            } else {
                setErrors('Server Error');
            }
        }
    }

    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{ height: "100vh" }}
        >
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={4}>
                    <Card
                        className="shadow-sm border-1"
                        style={{
                            width: "700px",
                            paddingTop: "50px",   // ✅ 카드 상단 여백
                            paddingBottom: "70px" // ✅ 카드 하단 여백
                        }}
                    >
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <h2
                                style={{
                                    fontSize: "48px",
                                    fontFamily: "'Gowun Batang', serif",
                                    color: "#67AB9F",
                                }}
                                className="text-center mb-4"
                            >
                                Login
                            </h2>

                            {errors && <Alert variant="danger">{errors}</Alert>}

                            <Form
                                onSubmit={LoginAction}
                                className="flex-grow-1 d-flex flex-column justify-content-between"
                            >
                                <div>
                                    <Form.Group className="mx-5 mb-4">
                                        <Form.Label>E-Mail</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="이메일을 입력해 주세요."
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mx-5 mb-4">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="비밀 번호를 입력해 주세요."
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </div>

                                {/* 버튼 그룹 */}
                                <div
                                    className="d-flex justify-content-center align-items-center mt-5"
                                    style={{ gap: "10px" }}
                                >
                                    <button
                                        type="submit"
                                        size="lg"
                                        style={{
                                            backgroundColor: "white",
                                            border: "2px solid #67AB9F",
                                            color: "#67AB9F",
                                            borderRadius: 10,
                                            fontWeight: 600,
                                            width: "200px",
                                            height: "58px",
                                        }}
                                    >
                                        로그인
                                    </button>

                                    <Link
                                        to="/signup"
                                        className="btn btn-outline-secondary"
                                        style={{
                                            border: "2px solid #adadadff",
                                            color: "#adadadff",
                                            borderRadius: 10,
                                            fontWeight: 600,
                                            width: "150px",
                                            height: "58px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        회원 가입
                                    </Link>
                                </div>

                                {/* 비밀번호 찾기 링크 */}
                                <div className="text-end mt-3 me-5">
                                    <Link to="/findpass" className="text-muted small">
                                        비밀번호를 잊으셨나요?
                                    </Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>

    );
}


export default Login;