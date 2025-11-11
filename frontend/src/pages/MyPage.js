import React, { useEffect, useState } from "react";
import { useAuth } from "../component/AuthContext";
import { useNavigate } from "react-router-dom";

// (All your existing logic from line 6 to 318 remains exactly the same)
// ... handleEditClick, handleSaveEdit, handleChangePassword, handleDelete, etc. ...

// 마이페이지 분할 준비

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
  // --- MODIFICATION: This is commented out in your file, but I've uncommented it for the new design ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file)); // 브라우저 미리보기
    }
  };
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
      formData.append("email", userInfo.email);    // 필수!
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
        multipartData.append("profileImage", profileImage); // --- MODIFICATION: Re-enabled this line ---


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
        setUserInfo(result);
        login(result); // AuthContext 갱신
        setPreview(result.profileImage || preview); // --- MODIFICATION: Update preview on save ---
        setProfileImage(result.profileImage || ""); // --- MODIFICATION: Clear file object ---
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

  // (Commented out navigation functions remain the same)

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
  // --- MODIFICATION: The entire return block and styles are replaced ---
  // --------------------------------------------------------------------
  return (
    <div style={styles.container}>
      {page === "view" && (
        <>
          <h2 style={styles.title}>회원 정보</h2>
          <div style={styles.profileViewWrapper}>
            <div style={styles.profileImageWrapper}>
              <img
                src={preview || "/default-profile.png"}
                alt="프로필"
                style={styles.profileImage}
              />
            </div>
            <div style={styles.infoWrapper}>
              <InfoItem label="이름" value={userInfo.username} />
              <InfoItem label="이메일" value={userInfo.email} />
              <InfoItem label="전화번호" value={userInfo.phone} />
              <InfoItem label="주소" value={userInfo.address} />
            </div>
          </div>
          <div style={styles.buttonGroup}>
            <button style={styles.primaryButton} onClick={handleEditClick}>
              정보 수정
            </button>
            <button style={styles.secondaryButton} onClick={handleChangePassword}>
              비밀번호 변경
            </button>
          </div>
          <div style={styles.dangerZone}>
            <button style={styles.dangerLink} onClick={handleDelete}>
              회원 탈퇴
            </button>
          </div>
        </>
      )}

      {page === "edit" && (
        <>
          <h2 style={styles.title}>회원 정보 수정</h2>
          <div style={styles.profileImageWrapper}>
            <img
              src={preview || "/default-profile.png"}
              alt="프로필"
              style={styles.profileImage}
            />
            <input type="file" accept="image/*" onChange={handleImageChange} style={styles.fileInput} />
          </div>

          <FormItem label="이름">
            <input
              name="username"
              value={editForm.username}
              onChange={handleEditChange}
              style={styles.input}
              _ />
          </FormItem>
          <FormItem label="전화번호">
            <input
              name="phone"
              CALLED_FUNCTION
              value={editForm.phone}
              onChange={handleEditChange}
              style={styles.input}
              placeholder="010-1234-5678"
            />
            {editError.phone && (
              <div style={styles.errorText}>{editError.phone}</div>
            )}
          </FormItem>
          <FormItem label="주소">
            _         <input
              name="address"
              value={editForm.address}
              onChange={handleEditChange}
              style={styles.input}
            />
          </FormItem>

          <div style={styles.buttonGroup}>
            <button style={styles.primaryButton} onClick={handleSaveEdit}>
              저장
            </button>
            <button style={styles.secondaryButton} onClick={() => setPage("view")}>
              취소
            </button>
          </div>
          _       </>
      )}

      {page === "password" && (
        <>
          <h2 style={styles.title}>비밀번호 변경</h2>
          <FormItem label="현재 비밀번호">
            <input
              type="password"
              name="currentPassword"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
              style={styles.input}
            />
          </FormItem>
          <FormItem label="새 비밀번호">
            <input
              type="password"
              name="newPassword"
              value={pwForm.newPassword}
              onChange={handlePwChange}
              style={styles.input}
            />
          </FormItem>
          <FormItem label="새 비밀번호 확인">
            <input
              type="password"
              name="confirmPassword"
              value={pwForm.confirmPassword}
              onChange={handlePwChange}
              A style={styles.input}
            />
          </FormItem>

          {pwError && <div style={{ ...styles.errorText, textAlign: 'center' }}>{pwError}</div>}

          <div style={styles.buttonGroup}>
            <button style={styles.primaryButton} onClick={handlePwSave}>
              NET-STYLE
              저장
            </button>
            <button style={styles.secondaryButton} onClick={() => setPage("view")}>
              취소
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// --- NEW COMPONENT ---
// This component replaces the old InfoItem to create the "label" and "value" style
const InfoItem = ({ label, value }) => (
  <div style={styles.infoItem}>
    <label style={styles.label}>{label}</label>
    <span style={styles.value}>{value || "-"}</span>
  </div>
);

// --- NEW COMPONENT ---
// A wrapper for form items to keep labels and inputs aligned
const FormItem = ({ label, children }) => (
  <div style={styles.formItem}>
    <label style={styles.label}>{label}</label>
    <div style={styles.inputControl}>
      {children}
    </div>
  </div>
);


// --- MODIFICATION: Entirely new styles object ---
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "800px", // Widen the container
    margin: "20px auto", // Center it in the content area
    boxSizing: 'border-box',
  },
  title: {
    textAlign: "left", // Align to the left
    marginBottom: "30px",
    fontSize: "28px", // Larger title
    fontWeight: "600",
    color: "#333",
    borderBottom: "1px solid #eee", // Subtle separator
    paddingBottom: "15px",
  },

  // --- View Styles ---
  profileViewWrapper: {
    display: "flex",
    alignItems: "flex-start",
    gap: "30px",
    marginBottom: "30px",
  },
  infoWrapper: {
    flex: 1,
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px", // More spacing
    fontSize: "16px",
  },
  label: {
    fontWeight: "600",
    color: "#555",
    width: "120px", // Fixed width for alignment
    flexShrink: 0,
  },
  value: {
    color: "#333",
    wordBreak: "break-all",
  },

  // --- Edit/Password Styles ---
  formItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  inputControl: {
    flex: 1,
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: 'border-box',
  },
  // (Your inputFocus style can be added here and applied with onFocus/onBlur)

  // --- Shared Styles ---
  profileImageWrapper: {
    textAlign: "center",
    marginBottom: "20px",
  },
  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "3px solid #fff",
  },
  fileInput: {
    display: "block",
    margin: "15px auto 0",
    fontSize: "13px",
    width: "220px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "30px",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
    justifyContent: 'flex-end', // Align buttons to the right
  },
  primaryButton: {
    padding: "12px 25px",
    fontSize: "15px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#fff",
    backgroundColor: "#67AB9F", // Your brand color
    transition: "background-color 0.2s",
  },
  secondaryButton: {
    padding: "12px 25px",
    fontSize: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#333",
    backgroundColor: "#fff",
    transition: "background-color 0.2s, border-color 0.2s",
  },
  dangerZone: {
    textAlign: 'right',
    marginTop: '20px',
  },
  dangerLink: {
    color: "#f44336",
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
    padding: '5px',
  },
  errorText: {
    color: "#f44336",
    fontSize: "13px",
    marginTop: "8px",
  },
};

export default MyPage;