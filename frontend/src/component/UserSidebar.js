import styles from './UserSidebar.module.css';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User,
    ShoppingCart,
    MessageSquare,
    ClipboardList,
    Star,
    FlaskConical,
    LogOut
} from 'lucide-react';

function UserSidebar({ activeView, setActiveView }) {

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleNavClick = (e, viewName) => {
        e.preventDefault();
        setActiveView(viewName);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>My Page</div>
            <ul className={styles.navMenu}>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'myPage' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'myPage')}
                    >
                        <User className={styles.icon} />
                        <span className={styles.navText}>회원 정보</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'orders' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'myPerfume')}
                    >
                        <FlaskConical className={styles.icon} />
                        <span className={styles.navText}>내 커스텀 향수</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'orders' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'orders')}
                    >
                        <ClipboardList className={styles.icon} />
                        <span className={styles.navText}>주문 내역</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'myInquiry' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'myInquiry')}
                    >
                        <MessageSquare className={styles.icon} />
                        <span className={styles.navText}>나의 문의</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'myReviews' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'myReviews')}
                    >
                        <Star className={styles.icon} />
                        <span className={styles.navText}>작성 리뷰</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'cart' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'cart')}
                    >
                        <ShoppingCart className={styles.icon} />
                        <span className={styles.navText}>장바구니</span>
                    </a>
                </li>
            </ul>
            <div className={styles.logoutSection}>
                <a
                    href="#"
                    className={styles.navLink}
                    onClick={handleLogout}
                >
                    <LogOut className={styles.icon} />
                    <span className={styles.navText}>로그아웃</span>
                </a>
            </div>
        </div>
    );
}
export default UserSidebar;