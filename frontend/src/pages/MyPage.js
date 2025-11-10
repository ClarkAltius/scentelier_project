import React, { useEffect, useState } from "react";
import { useAuth } from "../component/AuthContext";
import { useNavigate } from "react-router-dom";

const MyPage = () => {
  const { user, login, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState("view"); // "view" | "edit" | "password"
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(user?.profileImage || ""); //progileImage : 실제 업로드할 파일
  const [preview, setPreview] = useState(user?.profileImage || ""); // 미리보기 preview : 화면에 보여줄 미리보기 URL

  //비밀번호, 전화번호 형식
  const PASSWORD_REGEX = /^[A-Z][A-Za-z0-9!@#$%^&*]{7,}$/;
  const PHONE_REGEX = /^(\d{2,3}-\d{3,4}-\d{4})$/; // 000-0000-0000 형식

  // 초기 로딩
  useEffect(() => {
    if (!user) {
      if (!isDeleting) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      }
      return;
    }
    setUserInfo({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      profileImage: user.profileImage || "",
    });
    setPreview(user.profileImage || ""); //초기 미리보기 설정
  }, [user, navigate, isDeleting]);

  //프로필 사진 설정 시작
  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setProfileImage(file);
  //     setPreview(URL.createObjectURL(file)); // 브라우저 미리보기
  //   }
  // };
  //프로필 사진 설정 끝


  //수정코드 시작

  // 수정용 state
  const [editForm, setEditForm] = useState({
    username: "",
    phone: "",
    address: "",
  });

  // 전화번호 형식 에러 메시지용 state 추가
  const [editError, setEditError] = useState({
    phone: "",
    general: "",
  });

  // 비밀번호 오류 메시지
  const [pwError, setPwError] = useState("");


  // 수정 버튼 클릭 시
  const handleEditClick = () => {
    setEditForm({
      username: userInfo.username,
      phone: userInfo.phone,
      address: userInfo.address,
    });
    setPage("edit");
  };

  // 수정 입력 변경
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));

    // 전화번호 필드일 경우, 실시간 유효성 검사
    if (name === "phone") {
      if (value === "" || PHONE_REGEX.test(value)) {
        setEditError((prev) => ({ ...prev, phone: "" }));
      } else {
        setEditError((prev) => ({
          ...prev,
          phone: '전화번호 형식이 올바르지 않습니다.',
        }));
      }
    }
  }

  const handleSaveEdit = async () => {

    // 이전 전화번호 형식 에러 초기화
    setEditError({ phone: "", general: "" });

    //전화번호 형식 검사
    if (editForm.phone && !PHONE_REGEX.test(editForm.phone)) {
      setEditError((prev) => ({
        ...prev,
        phone: "전화번호 형식이 올바르지 않습니다. 000-0000-0000 형식으로 입력해 주세요.",
        general: "",
      }));
      return;
    }


    try {
      const formData = new URLSearchParams();
      formData.append("name", editForm.username); // username -> name
      formData.append("email", userInfo.email);    // 필수!
      formData.append("phone", editForm.phone);
      formData.append("address", editForm.address);

      let response;

      // 새 이미지가 선택되었으면 업로드
      if (profileImage instanceof File) {
        const multipartData = new FormData();
        multipartData.append("name", editForm.username);
        multipartData.append("email", userInfo.email);
        multipartData.append("phone", editForm.phone);
        multipartData.append("address", editForm.address);
        // multipartData.append("profileImage", profileImage);


        response = await fetch("http://localhost:9000/user/update", {
          method: "PUT",
          credentials: "include",
          body: multipartData, // multipart/form-data로 전송
        });
      } else {
        response = await fetch("http://localhost:9000/user/update", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });
      }

      const result = await response.json();

      if (response.ok) {
        // 서버에서 새로운 이미지 URL 반환했다고 가정
        const newUserData = {
          username: result.username,
          email: result.email,
          phone: result.phone,
          address: result.address,
          // profileImage: result.profileImage || preview, // 기존 preview 유지
        };

        setUserInfo(newUserData);
        // setPreview(newUserData.profileImage); // 미리보기 갱신
        login(newUserData);
        alert("회원 정보가 성공적으로 업데이트되었습니다.");
        setPage("view");
      } else {
        alert(`업데이트 실패: ${result.message || result}`);
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

  const handleCartList = () => {
    navigate("/cart/list"); // 장바구니 페이지로 이동
  };

  const handleOrderList = () => {
    navigate("/order/list"); // 주문내역 페이지로 이동
  };

  // const handlePayments = () => {
  //   navigate("/payments"); // 결제 페이지로 이동
  // };

  const handleMyReviewListPage = () => {
    navigate("/mypage/review"); // 내가 쓴 리뷰 조회하기 페이지로 이동
  };


  // 비밀번호 변경
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  const handleChangePassword = () => {
    // 비밀번호 입력값 초기화
    setPwForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPwError(""); // 에러 메시지도 초기화
    setPage("password");
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePwSave = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("모든 정보를 입력하세요.");
      return;
    }

    // 새 비밀번호 형식 검사
    if (!PASSWORD_REGEX.test(newPassword)) {
      setPwError("비밀번호는 첫 글자가 대문자이고 8자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("새 비밀번호가 일치하지 않습니다.");
      return;
    }




    //오류 초기화
    setPwError("");



    try {
      const response = await fetch(`http://localhost:9000/user/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: userInfo.email,
          currentPassword,
          newPassword,
        }).toString(),
        credentials: "include",
      });

      const result = await response.text();
      if (response.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        setPage("view");
      } else {
        setPwError(`오류: ${result}`);
      }
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      setPwError("서버 오류가 발생했습니다.");
    }
  };
  //비밀번호 변경 끝

  // 탈퇴
  const handleDelete = async () => {
    const confirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `http://localhost:9000/user/delete?email=${encodeURIComponent(userInfo.email)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const text = await response.text();
      if (response.ok) {
        alert(text);
        await logout();
        navigate("/");
      } else {
        alert(`오류: ${text}`);
      }
    } catch (error) {
      console.error("탈퇴 요청 실패:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  if (!userInfo) return <div>로딩 중...</div>;
  //탈퇴끝
  // --------------------------------------------------------------------
  // 렌더링 구간
  // --------------------------------------------------------------------
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {page === "view" && (
          <>
            <h2 style={styles.title}>마이페이지</h2>

            {/* 프로필 이미지 표시
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <img
                src={preview || "/default-profile.png"}
                alt="프로필 이미지"
                style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
              />
            </div> */}


            <InfoItem label="이름" value={userInfo.username} />
            <InfoItem label="이메일" value={userInfo.email} />
            <InfoItem label="전화번호" value={userInfo.phone} />
            <InfoItem label="주소" value={userInfo.address} />

            <div style={styles.buttonGroup}>
              <button style={{ ...styles.button, backgroundColor: "#67AB9F" }} onClick={handleEditClick}>
                회원정보 수정
              </button>
              <button style={{ ...styles.button, backgroundColor: "#67AB9F" }} onClick={handleChangePassword}>
                비밀번호 변경
              </button>
              <button style={{ ...styles.button, backgroundColor: "#f44336" }} onClick={handleDelete}>
                탈퇴
              </button>
            </div>
          </>
        )}

        {page === "edit" && (
          <>
            <h2 style={styles.title}>회원 정보 수정</h2>

            {/* 프로필 이미지
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <img
                src={preview || "/default-profile.png"}
                alt="프로필 이미지"
                style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
              />
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginTop: "10px" }} />
            </div> */}




            <div style={styles.inputWrapper}>
              <label style={styles.label}>이름</label>
              <input
                name="username"
                value={editForm.username}
                onChange={handleEditChange}
                style={styles.input}
              />
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>전화번호</label>
              <input
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
                style={styles.input}
              />
              <div style={styles.infoText}>※ 전화번호에 " - "을 넣어 입력해 주세요.</div>
              {/* 전화번호 형식 에러 메시지 표시 */}
              {editError.phone && (
                <div style={{ ...styles.errorText, whiteSpace: "pre-line" }}>{editError.phone}</div>
              )}

            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>주소</label>
              <input
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
                style={styles.input}
              />
            </div>

            <div style={styles.buttonGroup}>
              <button style={{ ...styles.button, backgroundColor: "#67AB9F" }} onClick={handleSaveEdit}>
                저장
              </button>
              <button style={{ ...styles.button, backgroundColor: "#ccc", color: "#000" }} onClick={() => setPage("view")}>
                취소
              </button>
            </div>
          </>
        )}

        {page === "password" && (
          <>
            <h2 style={styles.title}>비밀번호 변경</h2>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>현재 비밀번호</label>
              <input
                type="password"
                name="currentPassword"
                value={pwForm.currentPassword}
                onChange={handlePwChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputWrapper}>
              <label style={styles.label}>새 비밀번호</label>
              <input
                type="password"
                name="newPassword"
                value={pwForm.newPassword}
                onChange={handlePwChange}
                style={styles.input}
              />
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>새 비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                value={pwForm.confirmPassword}
                onChange={handlePwChange}
                style={styles.input}
              />
            </div>


            {pwError && <div style={styles.errorText}>{pwError}</div>}

            <div style={styles.buttonGroup}>
              <button style={{ ...styles.button, backgroundColor: "#67AB9F" }} onClick={handlePwSave}>
                저장
              </button>
              <button style={{ ...styles.button, backgroundColor: "#ccc", color: "#000" }} onClick={() => setPage("view")}>
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 정보 표시용
const InfoItem = ({ label, value }) => (
  <div style={styles.infoItem}>
    <label style={styles.label}>{label}</label>
    <span style={styles.valueBox}>{value}</span>
  </div>
);

const styles = {
  pageWrapper: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#eef2f5",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  container: {
    backgroundColor: "#fff",
    padding: "50px 30px",
    borderRadius: "15px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    width: "100%",
    maxWidth: "450px",
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "24px",
    color: "#333",
  },
  infoItem: {
    marginBottom: "15px"
  },
  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "5px",
    color: "#555",
  },
  valueBox: {
    display: "block",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
    fontSize: "14px",
    color: "#333",
  },
  inputWrapper: { marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
  },
  inputFocus: {
    borderColor: "#67AB9F",
    boxShadow: "0 0 5px rgba(103,171,159,0.4)",
  },
  buttonGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "20px",
  },
  button: {
    flex: "1 1 48%",
    padding: "12px 0",
    fontSize: "15px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#fff",
    transition: "all 0.2s",
    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
  },
  primaryButton: {
    backgroundColor: "#67AB9F",
  },
  dangerButton: {
    backgroundColor: "#f44336",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#333",
  },
  profileImageWrapper: {
    textAlign: "center",
    marginBottom: "20px",
  },
  profileImage: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  errorText: {
    color: "#f44336",
    fontSize: "13px",
    marginTop: "5px",
  },
};

export default MyPage;
