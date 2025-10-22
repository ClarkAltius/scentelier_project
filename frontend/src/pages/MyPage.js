import React, { useState } from "react";

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({
    name: "홍길동",
    email: "hong@example.com",
    address: "서울특별시",
  }); // 사용자 예시

  const handleEdit = () => {
    const newName = prompt("이름을 입력하세요", userInfo.name);
    const newEmail = prompt("이메일을 입력하세요", userInfo.email);
    const newAddress = prompt("주소를 입력하세요", userInfo.address);

    setUserInfo((prev) => ({
      name: newName !== null ? newName : prev.name,
      email: newEmail !== null ? newEmail : prev.email,
      address: newAddress !== null ? newAddress : prev.address,
    }));
  };

  const handleDelete = () => {
    const confirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (confirmed) {
      alert("탈퇴 완료되었습니다.");
      setUserInfo({ name: "", email: "", address: "" });
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>마이페이지</h2>

        <InfoItem label="이름" value={userInfo.name} />
        <InfoItem label="이메일" value={userInfo.email} />
        <InfoItem label="주소" value={userInfo.address} />

        <div style={styles.buttonGroup}>
          <button style={{ ...styles.button, backgroundColor: "#67AB9F" }} onClick={handleEdit}>
            수정
          </button>
          <button style={{ ...styles.button, backgroundColor: "#f44336" }} onClick={handleDelete}>
            탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div style={styles.infoItem}>
    <label style={styles.label}>{label}</label>
    <span style={styles.valueBox}>{value}</span>
  </div>
);

const styles = {
  pageWrapper: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
    height: "100vh",
    margin: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "400px",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "28px",
    marginBottom: "30px",
    textAlign: "center",
  },
  infoItem: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  valueBox: {
    display: "block",
    fontSize: "16px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#fafafa",
  },
  buttonGroup: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: "#fff",
  },
};

export default MyPage;
