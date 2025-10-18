import { Nav, Navbar, Container, NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function MenuItems() {

    const navigate = useNavigate();

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand href='/'>Scentelier</Navbar.Brand>
                <Navbar.Brand>임시</Navbar.Brand>
                <Nav className="me-auto">
                    <NavDropdown title={`1차 페이지 작성`}>
                        <NavDropdown.Item onClick={() => navigate(`/admin`)}>관리자 랜딩 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/login`)}>로그인 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => { }}>상품 상세 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => { navigate(`/cart/list`) }}>장바구니 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => { navigate(`/order/list`) }}>주문 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/productlist`)}>상품 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/productdetail`)}>상품 상세 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/perfumetest`)}>향수테스트 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/perfumeblending`)}>향수 배합 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/payments`)}>결제 페이지</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Container>
        </Navbar>
    );
}

export default MenuItems;