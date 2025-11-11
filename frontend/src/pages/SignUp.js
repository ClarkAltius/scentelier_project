import axios from "axios";
import { useState } from "react";
import { Card, Container, Row, Form, Col, Button, Alert } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import './Signup.css'; // 새로 만든 CSS 파일 import
import { useEffect } from "react"; //이미지 미리보기

import { useRef } from "react";
function App() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [profileImage, setProfileImage] = useState(null); // 프로필 이미지 넣기
    const [previewImage, setPreviewImage] = useState('http://localhost:9000/uploads/profile/default.png'); // 프로필 이미지 미리보기
    const [errors, setErrors] = useState({
        username: '', email: '', password: '', confirmPassword: '', address: '', phone: '', general: ''
    });

    const navigate = useNavigate();
    const PASSWORD_REGEX = /^[A-Z][A-Za-z0-9!@#$%^&*]{7,}$/;
    const PHONE_REGEX = /^(\d{2,3}-\d{3,4}-\d{4})$/; // 000-0000-0000 형식

    const fileInputRef = useRef(null);


    //프로필 이미지 미리보기
    useEffect(() => {
        // if (profileImage) {
        //     const objectUrl = URL.createObjectURL(profileImage);
        //     setPreviewImage(objectUrl);

        //     // 컴포넌트 언마운트 시 메모리 해제
        //     return () => URL.revokeObjectURL(objectUrl);
        // } else {
        setPreviewImage('http://localhost:9000/uploads/profile/default.png'); // 업로드 없으면 기본 이미지
        // }
    }, [profileImage]);

    const handleProfileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };


    //프로필 이미지 미리보기 끝


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
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('address', address);
            formData.append('phone', phone);


            // if (profileImage) {
            //     formData.append('profileImage', profileImage);
            // }
            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
        // Container, Row, Col 대신 CSS로 중앙 정렬되는 div 사용
        <div className="signup-page">
            <Card className="signup-card">
                <Card.Body>
                    <h2 className="text-center mb-4"
                        style={{ fontFamily: "'Gowun Batang', serif", }}
                    >Sign Up</h2>

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
                                onChange={(event) => {
                                    const val = event.target.value;
                                    setPhone(val);

                                    if (!PHONE_REGEX.test(val)) { // PHONE_REGEX는 정의되어 있다고 가정
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
                                onChange={async (event) => {
                                    const val = event.target.value;
                                    setEmail(val);
                                    if (!val.includes("@")) {
                                        setErrors((prev) => ({ ...prev, email: "올바른 이메일 형식이 아닙니다." }));
                                    } else {
                                        await checkEmailDuplication(val); // 이 함수는 정의되어 있다고 가정
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
                                onChange={(event) => {
                                    const val = event.target.value;
                                    setPassword(val);

                                    if (!PASSWORD_REGEX.test(val)) { // PASSWORD_REGEX는 정의되어 있다고 가정
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

                        {/* 💡 프로필 이미지 업로드 추가 */}
                        {/* <Form.Group className="mb-3">
                            <Form.Label>프로필 이미지</Form.Label>
                            <div className="profile-preview-container mb-2">
                                <img
                                    src={previewImage}
                                    alt="프로필 미리보기"
                                    className="profile-preview-img"
                                />
                            </div>

                            <Form.Control
                                type="file"
                                accept="image/*"
                                ref={fileInputRef} //ref 연결
                                // onChange={(e) => setProfileImage(e.target.files[0])}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setProfileImage(e.target.files[0]);
                                        if (fileInputRef.current) fileInputRef.current.blur();
                                    }
                                }}
                            />
                            <div className="mt-2 text-start">
                                <Button
                                    variant="secondary"
                                    className="mt-2 w-20"
                                    onClick={() => {
                                        setProfileImage(null); //업로드한 이미지 초기화
                                        setPreviewImage('http://localhost:9000/uploads/profile/default.png')//기본이미지로 설정
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = null; //파일 input 초기화
                                        }

                                    }}
                                >
                                    이미지 삭제
                                </Button>
                            </div>
                        </Form.Group> */}

                        {/* <small className="input-helper-text">
                            ※ 프로필 이미지는 기본이미지로 설정됩니다.
                        </small> */}





                        <Button type="submit" className="w-100 btn-primary-custom">
                            회원 가입
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div >
    );
}

export default App;
