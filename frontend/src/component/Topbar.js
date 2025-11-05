import styles from './Topbar.module.css';

const viewTitles = {
    dashboard: '대시보드',
    products: '상품 관리',
    stock: '재고 발주',
    orders: '주문 관리',
    inquiries: '고객 문의',
    inquiryDetail: '상세 고객 문의',
    userManagement: '사용자 관리',
    reviewManagement: '후기 관리',
    analytics: '상세 통계'
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