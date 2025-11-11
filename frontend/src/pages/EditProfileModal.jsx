import React, { useState } from "react";
import ModalWrapper from "../pages/ModalWrapper";
import styles from "./MyPage.module.css";
import axios from "axios";
import { API_BASE_URL } from "../config/config";
import { useEffect } from "react";

const EditProfileModal = ({ userInfo, onClose, onSave }) => {
    const [editForm, setEditForm] = useState({
        name: userInfo.username, // 백엔드 필드명 반영
        phone: userInfo.phone,
        address: userInfo.address,
    });
    const [editError, setEditError] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(`${API_BASE_URL}/user/profile/${userInfo.id}`);

    useEffect(() => {
        // userInfo.id가 바뀌면 preview도 갱신
        setPreview(`${API_BASE_URL}/user/profile/${userInfo.id}`);
    }, [userInfo]);

    const PHONE_REGEX = /^(\d{2,3}-\d{3,4}-\d{4})$/;

    const handleChange = (e) => {
        const { name, value } = e.target;

        // ⚡ 단순 덮어쓰기만
        setEditForm((prev) => ({ ...prev, [name]: value }));

        if (name === "phone" && value && !PHONE_REGEX.test(value)) {
            setEditError("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
        } else {
            setEditError("");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (editError) return;

        try {
            // 1️⃣ 프로필 이미지 업로드
            if (profileImage) {
                const imageForm = new FormData();
                imageForm.append("file", profileImage);

                await axios.post(
                    `${API_BASE_URL}/user/profile/upload/${userInfo.id}`,
                    imageForm,
                    { withCredentials: true }
                );
            }

            // 2️⃣ 회원 정보 업데이트

            const param = {
                email: userInfo.email, // 이메일 필수
                name: editForm.name,   // 백엔드 필드명 반영
                phone: editForm.phone,
                address: editForm.address,
            };
            console.log("전송 데이터:", param); // 확인용
            const response = await axios.put(
                `${API_BASE_URL}/user/update`,
                param,
                { withCredentials: true }
            );

            onSave(response.data); // 부모 컴포넌트(MyPage)에 변경 반영
            alert("회원 정보가 수정되었습니다.");
            onClose();
        } catch (err) {
            console.error("AxiosError:", err);
            const message =
                err.response?.data?.message || "서버 오류가 발생했습니다.";
            alert(message);
        }
    };

    return (
        <ModalWrapper title="회원 정보 수정" onClose={onClose}>
            <div className={styles.profileImageWrapper}>
                <img
                    src={preview}
                    alt="프로필"
                    className={styles.profileImage}
                    onError={(e) => {
                        e.target.src = `${API_BASE_URL}/user/profile/default.png`; // fallback 서버 경로
                    }}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                />
            </div>

            <div className={styles.formItem}>
                <label className={styles.label}>이름</label>
                <input
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    className={styles.input}
                />
            </div>

            <div className={styles.formItem}>
                <label className={styles.label}>전화번호</label>
                <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="010-1234-5678"
                />
                {editError && <div className={styles.errorText}>{editError}</div>}
            </div>

            <div className={styles.formItem}>
                <label className={styles.label}>주소</label>
                <input
                    name="address"
                    value={editForm.address}
                    onChange={handleChange}
                    className={styles.input}
                />
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.primaryButton} onClick={handleSubmit}>
                    저장
                </button>
                <button className={styles.secondaryButton} onClick={onClose}>
                    취소
                </button>
            </div>
        </ModalWrapper>
    );
};

export default EditProfileModal;
