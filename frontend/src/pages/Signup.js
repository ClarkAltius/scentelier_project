import axios from "axios";
import { useState } from "react";
import { Card, Container, Row, Form, Col, Button, Alert } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

function App() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');


    const [errors, setErrors] = useState({
        name: '', email: '', password: '', address: '', general: ''
    });

    const navigate = useNavigate();


    const SignupAction = async (event) => {
        event.preventDefault(); // 이벤트 전파 방지

        try {
            const url = `${API_BASE_URL}/signup`;
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('email', email);
            params.append('password', password);
            params.append('address', address);
            params.append('phone', phone);

            const response = await axios.post(url, params);

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
                                        placeholder="전화번호를 입력해 주세요."
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
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
                                        onChange={(event) => setEmail(event.target.value)}
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
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                        isInvalid={!!errors.password}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
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