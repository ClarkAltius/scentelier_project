import axios from "axios";
import { useState } from "react";
import { Card, Container, Row, Form, Col, Button, Alert } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

function App() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');


    const [errors, setErrors] = useState({
        username: '', email: '', password: '', confirmPassword: '', address: '', phone: '', general: ''
    });

    const navigate = useNavigate();
    const PASSWORD_REGEX = /^[A-Z][A-Za-z0-9!@#$%^&*]{7,}$/;
    const PHONE_REGEX = /^(\d{2,3}-\d{3,4}-\d{4})$/; // 000-0000-0000 형식

    const SignupAction = async (event) => {
        event.preventDefault(); // 이벤트 전파 방지

        // 클라이언트 단 전화번호 필수 체크
        if (!phone) {
            setErrors((prev) => ({ ...prev, phone: "전화번호는 필수 입력 항목입니다." }));
            return;
        }

        // 비밀번호 유효성 검사
        if (!PASSWORD_REGEX.test(password)) {
            setErrors((prev) => ({
                ...prev,
                password: "비밀번호는 첫 글자가 대문자이고 8자 이상이어야 합니다."
            }));
            return; // 서버 호출 중단
        } else {
            setErrors((prev) => ({ ...prev, password: "" })); // 오류 초기화
        }

        // 비밀번호 확인 체크
        if (password !== confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
            return;
        } else {
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        }

        try {
            const url = `${API_BASE_URL}/signup`;
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('email', email);
            params.append('password', password);
            params.append('address', address);
            params.append('phone', phone);

            const response = await axios.post(url, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.status === 200) {
                alert('회원 가입 성공');
                navigate('/login');
            }

        } catch (error) {
            if (error.response && error.response.data) {
                // 서버에서 받은 오류 정보를 객체로 저장합니다.
                setErrors(error.response.data);

            } else { // 입력 값 이외에 발생하는 다른 오류과 관련됨
                setErrors((prev) => ({ ...prev, general: '회원 가입 중에 오류가 발생하였습니다.' }));
            }
        }
    };

    //이메일 중복 체크
    const checkEmailDuplication = async (email) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/check-email`, {
                params: { email }
            });
            if (response.data.exists) {
                setErrors((prev) => ({ ...prev, email: "이미 존재하는 이메일입니다." }));
            } else {
                setErrors((prev) => ({ ...prev, email: "" }));
            }
        } catch (err) {
            console.error(err);
        }
    };
    //이메일 중복 체크 끝


    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
            <Row className="w-100 justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">회원 가입</h2>


                            {errors.general && <Alert variant="danger">{errors.general}</Alert>}



                            <Form onSubmit={SignupAction}>
                                <Form.Group className="mb-3">
                                    <Form.Label>이름</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="이름을 입력해 주세요."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        isInvalid={!!errors.username}
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.username}
                                    </Form.Control.Feedback>

                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>전화번호</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder='전화번호에 "-"을 넣어 입력해 주세요.'
                                        value={phone}
                                        // onChange={(e) => setPhone(e.target.value)}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            setPhone(val);

                                            if (!PHONE_REGEX.test(val)) {
                                                setErrors((prev) => ({ ...prev, phone: "전화번호 형식이 올바르지 않습니다." }));
                                            } else {
                                                setErrors((prev) => ({ ...prev, phone: "" }));
                                            }
                                        }}
                                        isInvalid={!!errors.phone}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>이메일</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="이메일을 입력해 주세요."
                                        value={email}
                                        // onChange={(event) => setEmail(event.target.value)}
                                        onChange={async (event) => {
                                            const val = event.target.value;
                                            setEmail(val);
                                            // 실시간 형식 체크 (간단하게 @ 포함 여부)
                                            if (!val.includes("@")) {
                                                setErrors((prev) => ({ ...prev, email: "올바른 이메일 형식이 아닙니다." }));
                                            } else {
                                                await checkEmailDuplication(val);
                                                // setErrors((prev) => ({ ...prev, email: "" }));
                                            }
                                        }}
                                        required
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>비밀 번호</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="비밀 번호를 입력해 주세요."
                                        value={password}
                                        // onChange={(event) => setPassword(event.target.value)}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            setPassword(val);

                                            // 실시간 유효성 검사
                                            if (!PASSWORD_REGEX.test(val)) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    password: "첫 글자가 대문자이고 8자 이상이어야 합니다."
                                                }));
                                            } else {
                                                setErrors((prev) => ({ ...prev, password: "" }));
                                            }
                                        }}
                                        required
                                        isInvalid={!!errors.password}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>비밀번호 확인</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="비밀번호를 다시 입력해 주세요."
                                        value={confirmPassword}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            setConfirmPassword(val);

                                            if (val !== password) {
                                                setErrors((prev) => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
                                            } else {
                                                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                                            }
                                        }}
                                        required
                                        isInvalid={!!errors.confirmPassword}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                                </Form.Group>




                                <Form.Group className="mb-3">
                                    <Form.Label>주소</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="주소를 입력해 주세요."
                                        value={address}
                                        onChange={(event) => setAddress(event.target.value)}
                                        required
                                        isInvalid={!!errors.address}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.address}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100">
                                    회원 가입
                                </Button>

                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default App;
