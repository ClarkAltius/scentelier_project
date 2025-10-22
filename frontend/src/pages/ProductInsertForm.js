import axios from "axios";
import { useState, useEffect } from "react";
import { Button, Container, Form, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";

function ProductInsertForm() {
  const comment = "상품 등록";
  const navigate = useNavigate();

  const initial_value = {
    name: "",
    price: "",
    category: "",
    stock: "",
    imageUrl: "",
    description: "",
    keyword: "",
    season: "",
  };

  const [product, setProduct] = useState(initial_value);
  const [keywords, setKeywords] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // keyword 상태 변경 시 product.keyword 자동 반영
  useEffect(() => {
    setProduct((prev) => ({ ...prev, keyword: keywords.join(",") }));
  }, [keywords]);

  const ControlChange = (event) => {
    const { name, value } = event.target;
    setProduct({ ...product, [name]: value });
  };

  const FileSelect = (event) => {
    const { name, files } = event.target;
    const file = files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setProduct({ ...product, [name]: reader.result });
    };
  };

  const SubmitAction = async (event) => {
    event.preventDefault();

    if (product.category === "-") {
      alert("카테고리를 반드시 선택해 주셔야 합니다.");
      return;
    }

    try {
      const url = `${API_BASE_URL}/product/insert`;
      const parameters = product;
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const response = await axios.post(url, parameters, config);
      console.log('상품 등록 : ');
      console.log(response.data);
      alert("상품이 성공적으로 등록 되었습니다.");

      setProduct(initial_value);
      //상품 추가 후 상품 페이지가 아니라 관리자 페이지로 이동하도록 변경했습니다. 2025-10-22 전일환
      navigate("/admin");
    } catch (error) {
      console.error(error.response?.data);
      alert("상품 등록에 실패하였습니다.");
    }
  };

  // Enter로 태그 추가
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();

      const trimmed = inputValue.trim();
      if (!keywords.includes(trimmed)) {
        setKeywords([...keywords, trimmed]);
      }
      setInputValue("");
    }
  };

  // 태그 제거
  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card className="rounded-4 p-4" style={{ maxWidth: "700px", width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Card.Body>
          <h3 className="text-center mb-4 fw-bold">{comment}</h3>
          <Form onSubmit={SubmitAction}>
            <Form.Group className="mb-3">
              <Form.Label>상품명</Form.Label>
              <Form.Control
                type="text"
                placeholder="상품명을 입력해 주세요."
                name="name"
                value={product.name}
                onChange={ControlChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>가격</Form.Label>
              <Form.Control
                type="number"
                placeholder="가격을 입력해 주세요."
                name="price"
                value={product.price}
                onChange={ControlChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>카테고리</Form.Label>
              <Form.Select
                name="category"
                value={product.category}
                onChange={ControlChange}
                required
              >
                <option value="-">-- 카테고리 선택 --</option>
                <option value="CITRUS">시트러스</option>
                <option value="FLORAL">플로럴</option>
                <option value="WOODY">우디</option>
                <option value="CHYPRE">시프레</option>
                <option value="GREEN">그린</option>
                <option value="FRUITY">프루티</option>
                <option value="POWDERY">파우더리</option>
                <option value="CRYSTAL">크리스탈</option>
              </Form.Select>
            </Form.Group>

            {/* ✅ 키워드 입력 */}
            <div className="mb-3">
              <Form.Label className="fw-bold">키워드</Form.Label>
              <Form.Control
                type="text"
                placeholder="키워드를 입력하고 Enter를 누르세요"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="mt-3">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="badge bg-success me-2 mb-2 p-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => removeKeyword(keyword)}
                  >
                    #{keyword} ✕
                  </span>
                ))}
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>재고</Form.Label>
              <Form.Control
                type="number"
                placeholder="재고를 입력해 주세요."
                name="stock"
                value={product.stock}
                onChange={ControlChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>시즌</Form.Label>
              <Form.Select
                name="season"
                value={product.season}
                onChange={ControlChange}
                required
              >
                <option value="-">-- 시즌 선택 --</option>
                <option value="SPRING">봄</option>
                <option value="SUMMER">여름</option>
                <option value="FALL">가을</option>
                <option value="WINTER">겨울</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>이미지</Form.Label>
              <Form.Control type="file" name="imageUrl" onChange={FileSelect} required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>상품 설명</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="상품 설명을 입력해 주세요."
                name="description"
                value={product.description}
                onChange={ControlChange}
                required
              />
            </Form.Group>

            <div className="text-center">
              <Button variant="success" type="submit" size="lg" className="px-5">
                {comment}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ProductInsertForm;
