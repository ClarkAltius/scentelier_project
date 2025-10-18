import styles from './Sidebar.module.css';

function Sidebar() {

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>Scentelier</div>
            <ul className={styles.navMenu}>
                <li className={styles.navItem}>
                    <a href="#" className={styles.navLink}>
                        <div className={styles.iconPlaceholder}>★</div>
                        <span className={styles.navText}>상품 관리</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a href="#" className={styles.navLink}>
                        <div className={styles.iconPlaceholder}>★</div>
                        <span className={styles.navText}>재고 관리</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a href="#" className={styles.navLink}>
                        <div className={styles.iconPlaceholder}>★</div>
                        <span className={styles.navText}>주문 관리</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a href="#" className={styles.navLink}>
                        <div className={styles.iconPlaceholder}>★</div>
                        <span className={styles.navText}>고객 문의사항</span>
                    </a>
                </li>
            </ul>
            <div className={styles.userInfo}>
                <a href="#" className={styles.navLink}>
                    <span className={styles.navText}>로그아웃</span>
                </a>
            </div>
        </div>
    );
}
export default Sidebar;