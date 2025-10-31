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
      phone: user.phone || "",
      address: user.address || "",
    });
  }, [user, navigate]);


  //수정코드 시작
  const handleEdit = async () => {
    const newName = prompt("이름을 입력하세요", userInfo.name);
    //const newEmail = prompt("이메일을 입력하세요", userInfo.email);
    const newPhone = prompt("전화번호를 입력하세요", userInfo.phone);
    const newAddress = prompt("주소를 입력하세요", userInfo.address);

    // 사용자가 취소하면 아무 것도 안 함
    if (
      newName === null &&
      //newEmail === null &&
      newPhone === null &&
      newAddress === null
    ) return;


    // 업데이트할 정보 준비
    const updatedInfo = {
      name: newName !== null ? newName : userInfo.name,
      email: userInfo.email, //이메일 변경불가 
      //newEmail !== null ? newEmail : userInfo.email,
      phone: newPhone !== null ? newPhone : userInfo.phone,
      address: newAddress !== null ? newAddress : userInfo.address,
    };

    try {
      // URLSearchParams를 사용해 쿼리스트링으로 변환
      const params = new URLSearchParams(updatedInfo).toString();
      const response = await fetch(`http://localhost:9000/user/update?${params}`, {
        method: "PUT",
        credentials: "include", // 쿠키 전송
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const result = await response.text(); // 백엔드에서 받은 문자열

      if (response.ok) {

        setUserInfo({ ...updatedInfo });
        alert(result) //"회원 정보가 성공적으로 업데이트되었습니다."
      } else {
        alert(`업데이트 실패: ${result}`);
      }
    } catch (error) {
      console.error("업데이트 요청 실패:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  //수정 코드 끝



  const handleMyInquiry = () => {
    navigate("/myinquiry"); // 문의사항 페이지로 이동
  };

  //탈퇴코드 시작
  const handleDelete = async () => {
    const confirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:9000/user/delete?email=${encodeURIComponent(userInfo.email)}`,
        {
          method: "DELETE",
          credentials: "include", // 쿠키 전송
        }
      );

      const text = await response.text();
      if (response.ok) {
        alert(text);
        setUserInfo({ name: "", email: "", address: "", phone: "" });
        localStorage.removeItem("user"); // 혹시 로컬 스토리지에 user가 저장되어 있다면 삭제
        sessionStorage.clear();
        navigate("/login");
      } else {
        alert(`오류: ${text}`);
      }
    } catch (error) {
      console.error("탈퇴 요청 실패:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };
  //탈퇴 코드 끝

  // 아직 사용자 정보가 로드되지 않았다면 로딩 표시
  if (!userInfo) return <div>로딩 중...</div>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>마이페이지</h2>

        <InfoItem label="이름" value={userInfo.name} />
        <InfoItem label="이메일" value={userInfo.email} />
        <InfoItem label="전화번호" value={userInfo.phone} />
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