import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/config";
import { Row, Col } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../component/AuthContext";

const Inquiry = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "",
    product_id: "",
    status: "PENDING"
  });

  const [errors, setErrors] = useState({});
  const [submittedInquiry, setSubmittedInquiry] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkedLogin, setCheckedLogin] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProductSelected, setIsProductSelected] = useState(false);

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    setCheckedLogin(true);

    (async () => {
      try {
        //console.log(user);
        const url = `${API_BASE_URL}/api/inquiries/my`;

        const res = await axios.get(url, { withCredentials: true });
        //console.log("응답:", res.data);

        const data = res.data?.data ?? res.data ?? [];
        //console.log(res);
        setInquiries(data);
      } catch (e) {
        console.error(e);
        setError(e.response?.data?.message || "문의사항을 불러오는 데 실패하였습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const handleChange = (e) => {

    const { id, value } = e.target;
    if (id === "product_id") {
      // product 선택 시 객체 형태로 저장
      setFormData({
        ...formData,
        product: value ? { id: parseInt(value) } : null
      });
    } else {
      setFormData({
        ...formData,
        [id]: value
      });

      // 문의 유형이 PRODUCT인지 확인
      if (id === "type") {
        setIsProductSelected(value === "PRODUCT");
        // 문의 유형이 PRODUCT가 아니면 product_id 초기화
        if (value !== "PRODUCT") {
          setFormData(prev => ({ ...prev, product: null }));
        }
      }
    }
    setErrors({
      ...errors,
      [id]: "",
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

    if (!formData.type.trim()) {
      newErrors.type = "문의유형을 선택해주세요.";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;


    // --- 서버로 전송 ---
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/inquiries/save`, formData, { withCredentials: true });

      if (response.data.success) {
        alert("문의가 성공적으로 전송되었습니다!");
        console.log(response.data.data); // 저장된 Inquiry 객체 확인 가능
        setSubmittedInquiry(response.data.data);

        //setInquiries([response.data.data, ...inquiries]);

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
          {/*  드롭다운 추가 */}
          <select
            id="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">-- 문의 유형 --</option>
            <option value="PRODUCT">상품</option>
            <option value="DELIVERY">배달</option>
            <option value="PAYMENT">결제</option>
            <option value="ETC">기타</option>
          </select>
          {errors.type && <div style={styles.error}>{errors.type}</div>}

          {/*  상품 드롭다운 추가 */}
          <select
            id="product_id"
            value={formData.product?.id || ""}
            onChange={handleChange}
            style={styles.select}
            disabled={!isProductSelected} // PRODUCT 선택 시 활성화
          >
            <option value="">상품 종류</option>
            <option value="1">Powder Whisper</option>
            <option value="2">Soft Veil</option>
            <option value="3">Velvet Dusk</option>
            <option value="4">Berry Radiant</option>
            <option value="5">Citrus Orchard</option>
            <option value="6">Tropical Bloom</option>
            <option value="7">Moss & Oak</option>
            <option value="8">Twilight Chypre</option>
            <option value="9">Ivy Whisper</option>
            <option value="10">Blossom Dew</option>
            <option value="11">Petal Reverie</option>
            <option value="12">Moonlight Floral</option>
            <option value="13">Crystal Veil</option>
            <option value="14">Pure Crystal</option>
            <option value="15">Frost Crystal</option>
            <option value="16">Forest Echo</option>
            <option value="17">Warm Timber</option>
            <option value="18">Wood Whisper</option>

          </select>
          {errors.type && <div style={styles.error}>{errors.type}</div>}


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

          <Col>
            <Link to="/myinquiry" className="form-end">

              <span className="inline-link" href="$">My 문의사항</span>

            </Link>
          </Col>
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
