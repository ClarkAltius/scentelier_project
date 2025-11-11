import React, { useEffect, useState } from "react";
import { useAuth } from "../component/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import axios from "axios";
import { API_BASE_URL } from "../config/config";

const MyPage = () => {
  const { user, login, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      if (!isDeleting) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      }
      return;
    }
    setUserInfo(user);
  }, [user, navigate, isDeleting]);

  // ✅ axios 기반으로 간결하게 바꾼 회원 정보 저장
  const handleSaveEdit = async (editData) => {
    try {
      // 1️⃣ 프로필 이미지 업로드
      if (editData.profileImage) {
        const imageForm = new FormData();
        imageForm.append("file", editData.profileImage);

        await axios.post(
          `${API_BASE_URL}/user/profile/upload/${userInfo.id}`,
          imageForm,
          { withCredentials: true }
        );
      }

      // 2️⃣ 회원 정보 업데이트
      const response = await axios.put(
        `${API_BASE_URL}/user/update`,
        {
          email: userInfo.email, // 필수
          name: editData.username,
          phone: editData.phone,
          address: editData.address,
        },
        { withCredentials: true }
      );

      setUserInfo(response.data);
      login(response.data); // Context 업데이트
      alert("회원 정보가 수정되었습니다.");
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || "서버 오류가 발생했습니다.";
      alert(message);
    }
  };

  const handleChangePassword = async (pwData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/change-password`,
        {
          email: userInfo.email,
          ...pwData,
        },
        { withCredentials: true }
      );
      alert("비밀번호가 변경되었습니다.");
      setShowPwModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "비밀번호 변경 실패");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/user/delete?email=${userInfo.email}`, {
        withCredentials: true,
      });
      alert("회원 탈퇴 완료");
      logout();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("탈퇴 실패");
    }
  };

  if (!userInfo) return <div>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>회원 정보</h2>
      <div className={styles.profileViewWrapper}>
        <div className={styles.profileImageWrapper}>
          <img
            src={`${API_BASE_URL}/user/profile/${userInfo.id}`}
            alt="프로필"
            className={styles.profileImage}
          />
        </div>
        <div className={styles.infoWrapper}>
          <InfoItem label="이름" value={userInfo.username} />
          <InfoItem label="이메일" value={userInfo.email} />
          <InfoItem label="전화번호" value={userInfo.phone} />
          <InfoItem label="주소" value={userInfo.address} />
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.primaryButton}
          onClick={() => setShowEditModal(true)}
        >
          정보 수정
        </button>
        <button
          className={styles.secondaryButton}
          onClick={() => setShowPwModal(true)}
        >
          비밀번호 변경
        </button>
      </div>

      <div className={styles.dangerZone}>
        <button className={styles.dangerLink} onClick={handleDelete}>
          회원 탈퇴
        </button>
      </div>

      {showEditModal && (
        <EditProfileModal
          userInfo={userInfo}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {showPwModal && (
        <ChangePasswordModal
          userInfo={userInfo}
          onClose={() => setShowPwModal(false)}
          onSave={handleChangePassword}
        />
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className={styles.infoItem}>
    <label className={styles.label}>{label}</label>
    <span className={styles.value}>{value || "-"}</span>
  </div>
);

export default MyPage;
