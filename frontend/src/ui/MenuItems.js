import { Nav, Navbar, Container, NavDropdown, NavItem } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";
import { ShoppingCart, User } from "lucide-react";

function MenuItems() {

    //로그아웃 버튼 관리용
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar bg="light" variant="light" expand="lg" fixed="top" className="shadow-sm mb-3">
            <Container>
                {/** 브랜드 로고, 이름 등 */}
                <Navbar.Brand
                    href='/'
                    style={{ fontFamily: "'Gowun Batang', serif", fontWeight: 'bold', fontSize: '1.5rem', color: '#67AB9F' }}
                >
                    Scentelier
                </Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link onClick={() => navigate('/product/list')} style={{ color: '#808080ff' }}>제품</Nav.Link>
                    <Nav.Link onClick={() => navigate('/perfume/finder')} style={{ color: '#808080ff' }}>향수 테스트</Nav.Link>
                    <Nav.Link onClick={() => navigate('/perfume/blending')} style={{ color: '#808080ff' }}>배합 향수</Nav.Link>

                    {/**개발용 링크들 */}
                    <NavDropdown bg="dark" variant="dark" title={`개발용 직접 링크`}>
                        <NavDropdown.Item onClick={() => navigate(`/admin`)}>관리자 랜딩 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/login`)}>로그인 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => { navigate(`/cart/list`) }}>장바구니 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => { navigate(`/order/list`) }}>주문 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/product/list`)}>상품 목록 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/product/detail`)}>상품 상세 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/product/insert`)}>상품 등록 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/perfume/finder`)}>향수테스트 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/perfume/blending`)}>향수 배합 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/payments`)}>결제 페이지</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
                <Nav>
                    {user ? (
                        // 로그인한 유저에겐 유저명 표기
                        <>
                            <Nav.Link onClick={() => navigate('/cart/list')} title="Cart">
                                <ShoppingCart size={20} style={{ color: '#808080ff' }} />
                            </Nav.Link>
                            <NavDropdown title={<User size={20} style={{ color: '#808080ff' }} />} id="user-nav-dropdown" align="end">
                                <NavDropdown.Item onClick={() => navigate('/order/list')}>내 주문</NavDropdown.Item>
                                {/* 회원정보 링크 추가 예정 */}
                                {/* <NavDropdown.Item onClick={() => navigate('/profile')}>Profile</NavDropdown.Item> */}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                            <Navbar.Text style={{ color: '#6c757d', fontFamily: "'Gowun Batang', serif", fontSize: '1rem', marginLeft: '-5px' }}> {/* Adjusted margin */}
                                {user.username || 'User'}
                            </Navbar.Text>                        </>
                    ) : (
                        // 기본적으로 로그인 버튼
                        <Nav.Link onClick={() => navigate('/login')}>Login</Nav.Link>
                    )}
                </Nav>
            </Container>
        </Navbar >
    );
}

export default MenuItems;