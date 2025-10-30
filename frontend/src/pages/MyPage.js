import React, { useEffect, useState } from "react";
import { useAuth } from "../component/AuthContext";
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const { user } = useAuth(); // 로그인한 사용자 정보
  const [userInfo, setUserInfo] = useState(null); // 초기값을 null로

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // 로그인된 사용자 정보로 상태 초기화
    setUserInfo({
      name: user.username || "",
      email: user.email || "",
      address: user.address || "",
    });
  }, [user, navigate]);

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

  const handleMyInquiry = () => {
    navigate("/myinquiry"); // 문의사항 페이지로 이동
  };

  const handleDelete = () => {
    const confirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (confirmed) {
      alert("탈퇴 완료되었습니다.");
      setUserInfo({ name: "", email: "", address: "" });
      // 실제 API 호출 후 로그아웃 처리 필요
    }
  };

  // 아직 사용자 정보가 로드되지 않았다면 로딩 표시
  if (!userInfo) return <div>로딩 중...</div>;

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
          <button style={{ ...styles.button, backgroundColor: "#67AB9F" }} onClick={handleMyInquiry}>
            나의 문의사항
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