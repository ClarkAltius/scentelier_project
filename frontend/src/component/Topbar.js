import styles from './Topbar.module.css';

const viewTitles = {
    dashboard: '대시보드',
    products: '상품 관리',
    stock: '재고 관리',
    orders: '주문 관리',
    inquiries: '고객 문의',
};
function Topbar({ activeView }) {

    const koreanTitle = viewTitles[activeView] || activeView.charAt(0).toUpperCase() + activeView.slice(1);

    return (
        <div className={styles.topbar} style={{ paddingTop: '14px' }}>
            {/* 3. Use the new koreanTitle variable here */}
            <h2>{koreanTitle}</h2>
        </div>
    );
}
export default Topbar;