import styles from './Sidebar.module.css';

import {
    LayoutDashboard,
    Package,
    Warehouse,
    ClipboardList,
    MessageSquare,
    LogOut
} from 'lucide-react';


function Sidebar({ activeView, setActiveView }) {

    const handleNavClick = (e, viewName) => {
        e.preventDefault();  //stop a tag from reloading
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
            </ul>
        </div >
    );
}
export default Sidebar;