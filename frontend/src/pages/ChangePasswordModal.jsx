// src/pages/ChangePasswordModal.jsx
import React, { useState } from "react";
import ModalWrapper from "../pages/ModalWrapper";
import styles from "./MyPage.module.css";

const ChangePasswordModal = ({ userInfo, onClose, onSave }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const PASSWORD_REGEX = /^[A-Z][A-Za-z0-9!@#$%^&*]{7,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const { currentPassword, newPassword, confirmPassword } = form;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("모든 정보를 입력하세요.");
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      setError("비밀번호는 첫 글자가 대문자이고 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    onSave(form);
  };

  return (
    <ModalWrapper title="비밀번호 변경" onClose={onClose}>
      <div className={styles.formItem}>
        <label className={styles.label}>현재 비밀번호</label>
        <input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formItem}>
        <label className={styles.label}>새 비밀번호</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formItem}>
        <label className={styles.label}>새 비밀번호 확인</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      {error && <div className={styles.errorText}>{error}</div>}

      <div className={styles.buttonGroup}>
        <button className={styles.primaryButton} onClick={handleSubmit}>저장</button>
        <button className={styles.secondaryButton} onClick={onClose}>취소</button>
      </div>
    </ModalWrapper>
  );
};

export default ChangePasswordModal;
