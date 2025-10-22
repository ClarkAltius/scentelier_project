import React, { useState } from "react";

const Inquiry = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
      isValid = false;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = "이메일을 입력해주세요.";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "메시지를 입력해주세요.";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setSuccessMessage("문의가 성공적으로 제출되었습니다.");
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } else {
      setSuccessMessage("");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>문의하기</h2>
        <form onSubmit={handleSubmit}>
          <InputGroup
            label="이름"
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
          <InputGroup
            label="이메일"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputGroup
            label="메시지"
            id="message"
            type="textarea"
            value={formData.message}
            onChange={handleChange}
            error={errors.message}
          />

          <div style={styles.buttonWrapper}>
            <button
              type="submit"
              style={styles.submitBtn}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#007BFF")}
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
