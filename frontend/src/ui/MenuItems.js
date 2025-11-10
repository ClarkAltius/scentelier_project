import { Nav, Navbar, Container, NavDropdown, NavItem } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";
import { ShoppingCart, User, Shield, LogOut } from "lucide-react";

function MenuItems() {

    //로그아웃 버튼 관리용
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isAdmin = user?.role === 'ADMIN';
    // console.log("isAdmin 체크" + isAdmin + "user.role은 : " + user?.role)

    const handleDesignClick = () => {
        if (user) {
            navigate("/perfume/blending"); // 로그인된 경우
        } else {
            alert('로그인이 필요한 서비스입니다.');
            navigate("/login"); // 로그인 안 되어 있으면 로그인 페이지로
        }
    };

    const handleCartClick = () => {
        // 3. This is the new logic
        // We navigate to the UserMyPage route and pass
        // a state object { view: 'cart' } along with it.
        navigate('/usermypage', { state: { view: 'cart' } });
    };



    return (
        <Navbar bg="light" variant="light" expand="lg" fixed="top" className="shadow-sm mb-3">
            <Container>
                {/** 브랜드 로고, 이름 등 */}
                <Navbar.Brand
                    href='/'
                    style={{
                        color: '#6B4C3B',
                        fontFamily: "'Gowun Batang', serif",
                        fontSize: '2rem',
                        marginBottom: 10,
                        textShadow: '1px 1px 2px #cfc1af'
                    }}
                >
                    Scentelier
                </Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link onClick={() => navigate('/product/list')} style={{ color: '#808080ff' }}>Products</Nav.Link>
                    <Nav.Link onClick={() => navigate('/perfume/finder')} style={{ color: '#808080ff' }}>Discover</Nav.Link>
                    <Nav.Link onClick={handleDesignClick} style={{ color: '#808080ff' }}>Design</Nav.Link>
                    {/* <Nav.Link onClick={() => navigate(`/inquiry`)} style={{ color: '#808080ff' }}>Inquiry</Nav.Link> */}
                </Nav>
                <Nav>
                    {user ? (
                        // 로그인한 유저에겐 유저명 표기
                        <>
                            {isAdmin && (
                                <Nav.Link onClick={() => navigate('/admin')} title="Admin">
                                    <Shield size={20} style={{ color: '#808080ff' }} />
                                </Nav.Link>
                            )}
                            <Nav.Link onClick={handleCartClick} title="Cart">
                                <ShoppingCart size={20} style={{ color: '#808080ff' }} />
                            </Nav.Link>

                            <Nav.Link onClick={() => navigate('/usermypage')} title="My Page">
                                <User size={20} style={{ color: '#808080ff' }} />
                            </Nav.Link>
                            <div style={{ paddingLeft: '10px' }}></div>
                            <Nav.Link
                                style={{ color: '#6c757d', fontSize: '1rem', marginRight: '15px' }}
                                onClick={() => navigate('/logout')}>
                                <LogOut size={20} style={{ color: '#808080ff' }} />
                            </Nav.Link>
                        </>

                    ) : (
                        // 기본적인 로그인 버튼
                        <Nav.Link onClick={() => navigate('/login')}>Login</Nav.Link>
                    )}
                </Nav>
                <div style={{ paddingLeft: '10px' }}></div>
                {/** Temporary. 개발용 링크들 */}
                <div style={{ border: '2px solid black', padding: '5px 10px', borderRadius: '5px' }}>
                    <NavDropdown bg="dark" variant="dark" title={`[임시] 링크 모음`}>
                        <NavDropdown.Item onClick={() => navigate(`/admin`)}>관리자 랜딩 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/login`)}>로그인 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => { navigate(`/cart/list`) }}>장바구니 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => { navigate(`/order/list`) }}>주문 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/product/list`)}>상품 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/product/detail`)}>상품 상세 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/perfume/finder`)}>향수테스트 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/perfume/blending`)}>향수 배합 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/payments`)}>결제 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/product/insert`)}>상품 입력 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/inquiry`)}>문의 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/myinquiry`)}>나의 문의 사항 페이지</NavDropdown.Item>
                        {/* <NavDropdown.Item onClick={() => navigate(`/inquirydetail`)}>문의 사항 상세 페이지</NavDropdown.Item> */}
                        <NavDropdown.Item onClick={() => navigate(`/mypage`)}>마이 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/findpass`)}>비밀번호 찾기 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/signup`)}>회원가입 페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/myperfume`)}>향수조합 저장페이지</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => navigate(`/usermypage`)}>유저 마이페이지</NavDropdown.Item>
                    </NavDropdown>
                </div>
            </Container>
        </Navbar >
    );
}

export default MenuItems;