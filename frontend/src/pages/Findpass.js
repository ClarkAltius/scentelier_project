import React, { useState } from "react";
import axios from "axios";

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

  const handleCheck = () => {
    const { name, email, phone } = inputs;
    if (!name.trim() || !email?.trim() || !phone?.trim()) {
      setMessage("모든 항목을 입력해주세요.");
      return;
    }
    // 일단 백엔드에서 일치 여부는 검사하지 않음. edit 페이지로 이동.
    setPage("edit");
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
      setSaveMessage("비밀번호는 첫 글자가 대문자이고, 8자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSaveMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("name", name);
      params.append("email", email);
      params.append("phone", phone);
      params.append("newPassword", newPassword);

      const response = await axios.post(
        "http://localhost:9000/user/reset-password",
        params.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, withCredentials: true }
      );

      setSaveMessage(response.data);
      setEditInputs({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      if (error.response) {
        setSaveMessage(error.response.data);
      } else {
        setSaveMessage("서버와의 연결에 문제가 있습니다.");
      }
    }
  };

  const styles = {
    pageWrapper: {
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f0f2f5",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    root: {
      background: "#fff",
      padding: "30px",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      width: "400px",
    },
    title: { textAlign: "center", marginBottom: "20px" },
    inputWrapper: { marginBottom: "15px" },
    label: { display: "block", marginBottom: "5px" },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#2b8cff",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginTop: "10px",
    },
    message: { color: "#f44336", textAlign: "center" },
    saveMessage: { color: "#4CAF50", textAlign: "center" },
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.root}>
        {page === "check" && (
          <>
            <h2 style={styles.title}>비밀번호 찾기</h2>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>이름</label>
              <input
                id="name"
                type="text"
                value={inputs.name}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>이메일</label>
              <input
                id="email"
                type="email"
                value={inputs.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>전화번호</label>
              <input
                id="phone"
                type="text"
                value={inputs.phone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.message}>{message}</div>
            <button style={styles.button} onClick={handleCheck}>
              다음
            </button>
          </>
        )}

        {page === "edit" && (
          <>
            <h2 style={styles.title}>비밀번호 재설정</h2>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>새 비밀번호</label>
              <input
                id="newPassword"
                type="password"
                value={editInputs.newPassword}
                onChange={handleEditChange}
                style={styles.input}
              />

            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                value={editInputs.confirmPassword}
                onChange={handleEditChange}
                style={styles.input}
              />
            </div>
            <div
              style={
                saveMessage.includes("성공")
                  ? styles.saveMessage
                  : styles.message
              }
            >
              {saveMessage}
            </div>
            <button style={styles.button} onClick={handleSave}>
              저장
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Findpass;
