import { Search, Calendar, ChevronDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import styles from './Dashboard.module.css';

/**
 * A dashboard component with placeholders for key metrics, a sales graph,
 * and a best-selling product.
 */
function Dashboard() {
    return (
        <div className={styles.dashboard}>
            {/* Header containing title and filter controls */}
            <header className={styles.header}>
                <h1>Dashboard</h1>
                <div className={styles.filters}>
                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input type="text" placeholder="Search orders, products..." />
                    </div>
                    <div className={styles.dropdown}>
                        <Calendar size={16} />
                        <span>Last 30 days</span>
                        <ChevronDown size={16} />
                    </div>
                    <div className={styles.dropdown}>
                        <Package size={16} />
                        <span>All Categories</span>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </header>

            {/* Main content grid for dashboard widgets */}
            <main className={styles.mainGrid}>
                {/* Metric Cards */}
                <div className={`${styles.card} ${styles.metricCard}`}>
                    <div className={styles.cardIcon} style={{ backgroundColor: '#E0F2FE' }}>
                        <DollarSign size={24} color="#0EA5E9" />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>총 매출</span>
                        <span className={styles.cardValue}>₩5,230,000</span>
                    </div>
                </div>
                <div className={`${styles.card} ${styles.metricCard}`}>
                    <div className={styles.cardIcon} style={{ backgroundColor: '#FEE2E2' }}>
                        <ShoppingCart size={24} color="#EF4444" />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>총 판매 수량</span>
                        <span className={styles.cardValue}>+1,235</span>
                    </div>
                </div>
                <div className={`${styles.card} ${styles.metricCard}`}>
                    <div className={styles.cardIcon} style={{ backgroundColor: '#D1FAE5' }}>
                        <Users size={24} color="#10B981" />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>신규 등록 고객</span>
                        <span className={styles.cardValue}>+89</span>
                    </div>
                </div>

                {/* Sales Graph */}
                <div className={`${styles.card} ${styles.graphCard}`}>
                    <h3>월별 매출</h3>
                    <div className={styles.graphPlaceholder}>
                        {/* Simple SVG Bar Chart Placeholder */}
                        <svg width="100%" height="90%" viewBox="0 0 350 170" preserveAspectRatio="xMidYMid meet">
                            <g className={styles.gridY} stroke="#E5E7EB" strokeWidth="1">
                                <line x1="30" y1="0" x2="350" y2="0"></line>
                                <line x1="30" y1="37.5" x2="350" y2="37.5"></line>
                                <line x1="30" y1="75" x2="350" y2="75"></line>
                                <line x1="30" y1="112.5" x2="350" y2="112.5"></line>
                                <line x1="30" y1="150" x2="350" y2="150"></line>
                            </g>
                            <g className={styles.gridX} fill="#9CA3AF" fontSize="10" textAnchor="end">
                                <text x="25" y="5">100</text>
                                <text x="25" y="42.5">75</text>
                                <text x="25" y="80">50</text>
                                <text x="25" y="117.5">25</text>
                                <text x="25" y="155">0</text>
                            </g>
                            <g className={styles.bars} fill="#3B82F6">
                                <rect x="50" y="90" width="30" height="60"></rect>
                                <rect x="100" y="50" width="30" height="100"></rect>
                                <rect x="150" y="75" width="30" height="75"></rect>
                                <rect x="200" y="30" width="30" height="120"></rect>
                                <rect x="250" y="110" width="30" height="40"></rect>
                                <rect x="300" y="60" width="30" height="90"></rect>
                            </g>
                            <g className={styles.labels} fill="#6B7280" fontSize="10" textAnchor="middle">
                                <text x="65" y="165">Jan</text>
                                <text x="115" y="165">Feb</text>
                                <text x="165" y="165">Mar</text>
                                <text x="215" y="165">Apr</text>
                                <text x="265" y="165">May</text>
                                <text x="315" y="165">Jun</text>
                            </g>
                        </svg>
                    </div>
                </div>

                {/* Best Seller */}
                <div className={`${styles.card} ${styles.bestSellerCard}`}>
                    <h3>Most Selling Product</h3>
                    <div className={styles.productInfo}>
                        <img src="https://placehold.co/80x80/e2e8f0/64748b?text=Perfume" alt="Product" className={styles.productImage} />
                        <div className={styles.productDetails}>
                            <span className={styles.productName}>Signature Scent No. 5</span>
                            <span className={styles.productSku}>SKU: SS-N5-50ML</span>
                            <span className={styles.productSales}>215 개 판매</span>
                        </div>
                    </div>
                    <a href="#" className={styles.detailsLink}>상품 조회</a>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
