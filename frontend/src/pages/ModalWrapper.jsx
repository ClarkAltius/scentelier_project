// src/components/ModalWrapper.jsx
import React from "react";
import styles from "./ModalWrapper.module.css";

const ModalWrapper = ({ title, children, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default ModalWrapper;
