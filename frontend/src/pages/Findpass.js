import React, { useState } from "react";

const storedUserInitial = {
  name: "홍길동",
  email: "hong@example.com",
  address: "서울특별시 강남구",
  password: "password123",
}; // 사용자 정보 예시

const Findpass = () => {
  const [storedUser, setStoredUser] = useState(storedUserInitial);

  const [page, setPage] = useState("check"); // "check" or "edit"

  // 입력 필드 상태
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [editInputs, setEditInputs] = useState({
    editPassword: "",
    editPasswordConfirm: "",
  });

  // 메시지 상태
  const [message, setMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // 입력 변경 처리 (비밀번호 찾기 페이지)
  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.id]: e.target.value,
    });
    setMessage("");
  };

  // 수정 입력 변경 처리
  const handleEditChange = (e) => {
    setEditInputs({
      ...editInputs,
      [e.target.id]: e.target.value,
    });
    setSaveMessage("");
  };

  // 확인 버튼 클릭 (비밀번호 찾기)
  const handleCheck = () => {
    const { name, email, address } = inputs;
    if (!name.trim() || !email.trim() || !address.trim()) {
      setMessage("모든 항목을 입력해주세요.");
      return;
    }

    const match =
      name.trim() === storedUser.name &&
      email.trim() === storedUser.email &&
      address.trim() === storedUser.address;

    if (match) {
      setPage("edit");
      // 초기화 편집용 입력도 초기화
      setEditInputs({ editPassword: "", editPasswordConfirm: "" });
      setMessage("");
      setSaveMessage("");
    } else {
      setMessage("입력한 정보가 일치하지 않습니다.");
    }
  };

  // 저장 버튼 클릭 (수정 페이지)
  const handleSave = () => {
    const { editPassword, editPasswordConfirm } = editInputs;

    // 비밀번호 입력 확인
    if (editPassword || editPasswordConfirm) {
      if (editPassword !== editPasswordConfirm) {
        setSaveMessage("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    // 비밀번호 변경
    setStoredUser((prev) => ({
      ...prev,
      password: editPassword ? editPassword : prev.password,
    }));

    setSaveMessage("정보가 성공적으로 저장되었습니다.");

    // 비밀번호 입력 초기화
    setEditInputs({ editPassword: "", editPasswordConfirm: "" });
  };

  // 스타일 (inline style 객체)
  const styles = {
    pageWrapper: {
      fontFamily: "Arial, sans-serif",
      margin: 0,
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
      boxSizing: "border-box",
    },
    title: {
      textAlign: "center",
      marginBottom: "20px",
    },
    inputWrapper: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#2b8cff",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      marginTop: "10px",
    },
    saveButton: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#4CAF50",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      marginTop: "10px",
    },
    message: {
      marginTop: "10px",
      fontSize: "14px",
      color: "#f44336",
      textAlign: "center",
      minHeight: "18px",
    },
    saveMessage: {
      marginTop: "10px",
      fontSize: "14px",
      color: "#4CAF50",
      textAlign: "center",
      minHeight: "18px",
    },
    readOnlyInput: {
      backgroundColor: "#eee",
    },
  };

  // 입력 필드 컴포넌트 (라벨 + input)
  const InputField = ({
    label,
    id,
    type = "text",
    value,
    onChange,
    readOnly = false,
  }) => (
    <div style={styles.inputWrapper}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{ ...styles.input, ...(readOnly ? styles.readOnlyInput : {}) }}
      />
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.root}>
        {page === "check" && (
          <>
            <h2 style={styles.title}>비밀번호 찾기</h2>
            <InputField
              label="이름"
              id="username"
              value={inputs.username}
              onChange={handleChange}
            />
            <InputField
              label="이메일"
              id="email"
              type="email"
              value={inputs.email}
              onChange={handleChange}
            />
            <InputField
              label="전화번호"
              id="phone"
              value={inputs.phone}
              onChange={handleChange}
            />
            <div style={styles.message}>{message}</div>
            <button type="button" style={styles.button} onClick={handleCheck}>
              확인
            </button>
          </>
        )}

        {page === "edit" && (
          <>
            <h2 style={styles.title}>수정 페이지</h2>
            <InputField
              label="이름"
              id="editName"
              value={storedUser.name}
              readOnly
            />
            <InputField
              label="이메일"
              id="editEmail"
              type="email"
              value={storedUser.email}
              readOnly
            />
            <InputField
              label="주소"
              id="editAddress"
              value={storedUser.address}
              readOnly
            />
            <InputField
              label="비밀번호 변경"
              id="editPassword"
              type="password"
              value={editInputs.editPassword}
              onChange={handleEditChange}
            />
            <InputField
              label="비밀번호 확인"
              id="editPasswordConfirm"
              type="password"
              value={editInputs.editPasswordConfirm}
              onChange={handleEditChange}
            />
            <div style={saveMessage.includes("성공") ? styles.saveMessage : styles.message}>
              {saveMessage}
            </div>
            <button type="button" style={styles.saveButton} onClick={handleSave}>
              저장
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Findpass;