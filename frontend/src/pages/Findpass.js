import React, { useState } from "react";
import axios from "axios";
import './Findpass.css'; // 새로 만든 CSS 파일 import

const Findpass = () => {
  const [page, setPage] = useState("check"); // "check" or "edit"
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editInputs, setEditInputs] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  //비밀번호 형식
  const PASSWORD_REGEX = /^[A-Z][A-Za-z0-9!@#$%^&*]{7,}$/;


  const handleChange = e => {
    setInputs({
      ...inputs,
      [e.target.id]: e.target.value,
    });
    setMessage("");
  };

  const handleEditChange = (e) => {
    setEditInputs({
      ...editInputs,
      [e.target.id]: e.target.value,
    });
    setSaveMessage("");
  };

  const handleCheck = async () => {
    const { name, email, phone } = inputs;
    if (!name.trim() || !email?.trim() || !phone?.trim()) {
      setMessage("모든 항목을 입력해주세요.");
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("name", name);
      params.append("email", email);
      params.append("phone", phone);
      // 비밀번호 없이 호출 = 정보 확인만
      await axios.post(
        "http://localhost:9000/user/reset-password",
        params.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, withCredentials: true }
      );
      setPage("edit"); // 정보 확인 OK → 비밀번호 변경 페이지로 이동
    } catch (error) {
      setMessage(error.response?.data || "서버 오류");
    }
  };

  const handleSave = async () => {
    const { name, email, phone } = inputs;
    const { newPassword, confirmPassword } = editInputs;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setSaveMessage("모든 항목을 입력해주세요.");
      return;
    }

    if (!newPassword.trim() || !confirmPassword?.trim()) {
      setSaveMessage("새 비밀번호를 입력해주세요.");
      return;
    }

    // 비밀번호 형식 검사
    if (!PASSWORD_REGEX.test(newPassword)) {
      setSaveMessage("비밀번호를 확인해주세요");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSaveMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    const params = new URLSearchParams();
    params.append("name", name);
    params.append("email", email);
    params.append("phone", phone);
    params.append("newPassword", newPassword);

    try {
      const response = await axios.post(
        "http://localhost:9000/user/reset-password",
        params.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, withCredentials: true }
      );
      setSaveMessage(response.data);
      setEditInputs({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      setSaveMessage(error.response?.data || "서버 오류");
    }
  };

  return (
    <div className="findpass-page">
      <div className="findpass-card">
        {page === "check" && (
          <>
            <h2 className="findpass-title">비밀번호 찾기</h2>
            <div className="input-wrapper">
              <label htmlFor="name" className="input-label">이름</label>
              <input
                id="name"
                type="text"
                value={inputs.name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="input-wrapper">
              <label htmlFor="email" className="input-label">이메일</label>
              <input
                id="email"
                type="email"
                value={inputs.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="input-wrapper">
              <label htmlFor="phone" className="input-label">전화번호</label>
              <input
                id="phone"
                type="text"
                value={inputs.phone}
                onChange={handleChange}
                className="input-field"
              />
              <small className="input-helper-text">
                ※ 전화번호에 " - "을 넣어 입력해 주세요.
              </small>
            </div>
            <div className="form-message form-message-error">{message}</div>
            <button className="btn-primary-custom" onClick={handleCheck}>
              다음
            </button>
          </>
        )}

        {page === "edit" && (
          <>
            <h2 className="findpass-title">비밀번호 재설정</h2>
            <div className="input-wrapper">
              <label htmlFor="newPassword" className="input-label">새 비밀번호</label>
              <input
                id="newPassword"
                type="password"
                value={editInputs.newPassword}
                onChange={handleEditChange}
                className="input-field"
              />
            </div>
            <div className="input-wrapper">
              <label htmlFor="confirmPassword" className="input-label">비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                value={editInputs.confirmPassword}
                onChange={handleEditChange}
                className="input-field"
              />
              <small className="input-helper-text">
                ※ 비밀번호는 첫 글자가 대문자이고, 8자 이상이어야 합니다.
              </small>
            </div>

            {/* 메시지 스타일을 동적으로 변경 */}
            <div
              className={`
                form-message 
                ${saveMessage.includes("성공")
                  ? "form-message-success"
                  : "form-message-error"}
              `}
            >
              {saveMessage}
            </div>
            <button className="btn-primary-custom" onClick={handleSave}>
              저장
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Findpass;
