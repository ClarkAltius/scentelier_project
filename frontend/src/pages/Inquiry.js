import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/config";

const Inquiry = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.id]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- 유효성 검사 ---
    const newErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = "문의사항 제목을 입력해주세요.";
      isValid = false;
    }

    if (!formData.content.trim()) {
      newErrors.content = "문의사항 내용을 입력해주세요.";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    // --- 서버로 전송 ---
    //   try {
    //     const response = await axios.post(`${API_BASE_URL}/api/inquiries/save`, formData);

    //     if (response.data.success) {
    //       setSuccessMessage("문의가 성공적으로 전송되었습니다!");
    //       setFormData({ name: "", email: "", message: "" });
    //     } else {
    //       console.error("서버 오류:", response.data.error);
    //       alert("문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.");
    //     }
    //   } catch (error) {
    //     console.error("네트워크 또는 서버 오류:", error);
    //     alert("서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    //   }
    // };

    // try {
    //   await axios.post(`${API_BASE_URL}/api/inquiries/save`, formData);
    //   alert("문의가 성공적으로 전송되었습니다!");
    //   console.log(response.data.successMessage);
    // } catch (error) {
    //   console.error(error);

    //   if (error.response && error.response.data && error.response.data.error) {
    //     alert("서버 오류: " + error.response.data.error);
    //   } else {
    //     alert("문의 전송 중 오류가 발생했습니다.");
    //   }
    // }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/inquiries/save`, formData, { withCredentials: true });

      if (response.data.success) {
        alert("문의가 성공적으로 전송되었습니다!");
        console.log(response.data.data); // 저장된 Inquiry 객체 확인 가능
        setFormData({ title: "", content: "" });
      } else {
        console.error("서버 오류:", response.data.error);
        alert("문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.");
      }

    } catch (error) {
      console.error(error);

      if (error.response && error.response.data && error.response.data.error) {
        alert("서버 오류: " + error.response.data.error);
      } else {
        alert("문의 전송 중 오류가 발생했습니다.");
      }
    }

  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>문의하기</h2>
        <form onSubmit={handleSubmit}>
          <InputGroup
            label="문의사항 제목"
            id="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
          />
          <InputGroup
            label="내용"
            id="content"
            type="textarea"
            value={formData.content}
            onChange={handleChange}
            error={errors.content}
          />

          <div style={styles.buttonWrapper}>
            <button
              type="submit"
              style={styles.submitBtn}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#67AB9F")}
            >
              보내기
            </button>
          </div>

          {successMessage && (
            <div style={styles.successMessage}>{successMessage}</div>
          )}
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, id, type, value, onChange, error }) => (
  <div style={styles.inputGroup}>
    <label htmlFor={id} style={styles.label}>
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        style={{ ...styles.input, height: "100px", resize: "vertical" }}
      />
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        style={styles.input}
      />
    )}
    {error && <div style={styles.error}>{error}</div>}
  </div>
);

const styles = {
  page: {
    backgroundColor: "#f7f7f7",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    minHeight: "100vh",
  },
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginTop: "5px",
  },
  buttonWrapper: {
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: "#67AB9F",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  successMessage: {
    marginTop: "15px",
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
  },
};

export default Inquiry;