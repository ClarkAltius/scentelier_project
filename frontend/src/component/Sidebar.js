import styles from './Sidebar.module.css';

import {
    LayoutDashboard,
    Package,
    Warehouse,
    ClipboardList,
    MessageSquare,
    Users,
    Star,
    BarChart4
} from 'lucide-react';


function Sidebar({ activeView, setActiveView }) {

    const handleNavClick = (e, viewName) => {
        e.preventDefault();
        setActiveView(viewName);
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>관리자 페이지</div>
            <ul className={styles.navMenu}>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'dashboard' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'dashboard')}>
                        <LayoutDashboard className={styles.icon} />
                        <span className={styles.navText}>대시보드</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'products' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'products')}>
                        <Package className={styles.icon} />
                        <span className={styles.navText}>상품 관리</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'stock' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'stock')}>
                        <Warehouse className={styles.icon} />
                        <span className={styles.navText}>재고 발주</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'orders' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'orders')}>
                        <ClipboardList className={styles.icon} />
                        <span className={styles.navText}>주문 관리</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'inquiries' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'inquiries')}>
                        <MessageSquare className={styles.icon} />
                        <span className={styles.navText}>고객 문의사항</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'userManagement' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'userManagement')}>
                        <Users className={styles.icon} />
                        <span className={styles.navText}>사용자 관리</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'reviewManagement' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'reviewManagement')}>
                        <Star className={styles.icon} />
                        <span className={styles.navText}>후기 관리</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a
                        href="#"
                        className={`${styles.navLink} ${activeView === 'analytics' ? styles.active : ''}`}
                        onClick={(e) => handleNavClick(e, 'analytics')}>
                        <BarChart4 className={styles.icon} />
                        <span className={styles.navText}>상세 통계</span>
                    </a>
                </li>

            </ul>
        </div >
    );
}
export default Sidebar;