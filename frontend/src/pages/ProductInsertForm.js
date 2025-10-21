import axios from "axios";
import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";

function ProductInsertForm(props) {
    const comment = '상품 등록';
    const nevigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem("user"));
    const initial_value = {
        name: '', price: '', category: '', stock: '', imageUrl: '', description: '', keyword:''
    };

    const [product, setProduct] = useState(initial_value);
    if (!user || user?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const ControlChange = (event) => {
        const {name, value} = event.target;
        setProduct({ ...product, [name]: value });
    }

    const FileSelect = (event) => {
        const {name, files} = event.target;
        const file = files[0];

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onloadend = () => {
            const result = reader.result;
            console.log(result);
            
            setProduct({ ...product, [name]: result });
        };
    }

    const SubmitAction = async (event) => {
        event.preventDefault();

        if(product.category === "-") {
            alert('카테고리를 반드시 선택해 주셔야 합니다.');
            return;
        }

        try {
            const url = `${API_BASE_URL}/product/insert`;
            const parameters = product;
            const config = {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            };

            const response = await axios.post(url, parameters, config);

            console.log(`상품 등록 : [${response.data}]`);
            alert('상품이 성공적으로 등록 되었습니다.');

            setProduct(initial_value);

            nevigate('/product/list');
        } catch (error) {
            console.log(error.response?.data);
            console.log(error.response?.status);

            console.log(`오류 내용 : ${error}`);
            alert('상품 등록에 실패하였습니다.');
        }
    }

    return(
        <Container>
            <h1>{comment}</h1>
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
                        type="text"
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
                        required>
                        <option value="-">-- 카테고리 선택 --</option>
                        <option value="BREAD">빵</option>
                        <option value="BEVERAGE">음료수</option>
                        <option value="CAKE">케이크</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>재고</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="재고을(를) 입력해 주세요."
                        name="stock"
                        value={product.stock}
                        onChange={ControlChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>이미지</Form.Label>
                    <Form.Control 
                        type="file"
                        name="image"
                        onChange={FileSelect}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>상품 설명</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="상품 설명을(를) 입력해 주세요."
                        name="description"
                        value={product.description}
                        onChange={ControlChange}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" size="lg">
                    {comment}
                </Button>

            </Form>
        </Container>
    );
}

export default ProductInsertForm;