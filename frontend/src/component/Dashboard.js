import React from 'react';
import styles from './Dashboard.module.css';
import { useState, useEffect } from 'react';
import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Beaker,
    ClipboardList,
    MessageSquare,
    TrendingUp,
    Star,
    AlertTriangle
} from 'lucide-react';

// API 는 외부 파일에서 작성. import
import {
    getKpis,
    getSalesBreakdown,
    getOperationalData,
    getBestSellers,
    getMostUsedIngredients,
    getLowStockItems,
    getMonthlySales
} from '../api/DashboardApi';

function Dashboard() {

    const [kpiData, setKpiData] = useState(null);
    const [salesBreakdown, setSalesBreakdown] = useState(null);
    const [operationalData, setOperationalData] = useState(null);
    const [bestSellers, setBestSellers] = useState([]);
    const [mostUsedIngredients, setMostUsedIngredients] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);

    // === 로딩 & 에러 ===
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // === DATA FETCHING ===
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 모든 데이터 동시 호출
                const [
                    kpis,
                    breakdown,
                    opsData,
                    sellers,
                    ingredients,
                    lowStock,
                    sales
                ] = await Promise.all([
                    getKpis(),
                    getSalesBreakdown(),
                    getOperationalData(),
                    getBestSellers(),
                    getMostUsedIngredients(),
                    getLowStockItems(),
                    getMonthlySales()
                ]);

                // 모든 스테이트 set
                setKpiData(kpis);
                setSalesBreakdown(breakdown);
                setOperationalData(opsData);
                setBestSellers(sellers);
                setMostUsedIngredients(ingredients);
                setLowStockItems(lowStock);
                setMonthlySales(sales);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("대시보드 데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []); // Run once on mount! 

    // === 스테이트 렌더링 ===
    if (loading) {
        return <div className={styles.centeredMessage}>Loading dashboard...</div>;
    }

    if (error) {
        return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;
    }

    // === 컴포넌트 렌더링 ===
    // 에러 방지 위해서 데이터 존재여부 체크
    if (!kpiData || !salesBreakdown || !operationalData) {
        return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>Incomplete dashboard data.</div>;
    }

    return (
        <div className={styles.dashboard}>
            {/* Top Row: High-Level KPIs */}
            <div className={styles.kpiGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <DollarSign size={20} className={styles.cardIcon} />
                        <h3>총 매출</h3>
                    </div>
                    <p className={styles.kpiValue}>₩{kpiData.totalRevenue.toLocaleString()}</p>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <ShoppingCart size={20} className={styles.cardIcon} />
                        <h3>총 주문 수</h3>
                    </div>
                    <p className={styles.kpiValue}>{kpiData.totalOrders.toLocaleString()}</p>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <TrendingUp size={20} className={styles.cardIcon} />
                        <h3>평균 주문 금액</h3>
                    </div>
                    <p className={styles.kpiValue}>₩{(kpiData.totalRevenue / kpiData.totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Users size={20} className={styles.cardIcon} />
                        <h3>신규 고객</h3>
                    </div>
                    <p className={styles.kpiValue}>+{kpiData.newCustomers}</p>
                </div>
            </div>

            {/* Second Row: Sales Charts */}
            <div className={styles.mainGrid}>
                <div className={`${styles.card} ${styles.largeCard}`}>
                    <h3>월별 매출 추이</h3>
                    <div className={styles.chartPlaceholder}>
                        {/* Placeholder for a real bar chart component */}
                        <p>Bar chart showing monthly sales would be here.</p>
                    </div>
                </div>
                <div className={styles.card}>
                    <h3>매출 비중</h3>
                    <div className={styles.chartPlaceholder}>
                        {/* Placeholder for a real pie/donut chart component */}
                        <p>Pie chart for Finished vs. Custom Perfumes would be here.</p>
                        <ul className={styles.chartLegend}>
                            <li><span className={styles.legendDot} style={{ backgroundColor: '#4ade80' }}></span>완제품: ₩{salesBreakdown.finishedPerfumes.toLocaleString()}</li>
                            <li><span className={styles.legendDot} style={{ backgroundColor: '#60a5fa' }}></span>커스텀: ₩{salesBreakdown.customPerfumes.toLocaleString()}</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Third Row: Operational Insights */}
            <div className={styles.operationalGrid}>
                {/* Actionable Items */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <ClipboardList size={20} className={styles.cardIcon} />
                        <h3>처리 대기 주문</h3>
                    </div>
                    <p className={`${styles.kpiValue} ${styles.operationalValue}`}>{operationalData.pendingOrders}</p>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <MessageSquare size={20} className={styles.cardIcon} />
                        <h3>미응답 고객 문의</h3>
                    </div>
                    <p className={`${styles.kpiValue} ${styles.operationalValue}`}>{operationalData.openInquiries}</p>
                </div>

                {/* Low Stock Items */}
                <div className={`${styles.card} ${styles.listCard}`}>
                    <div className={styles.cardHeader}>
                        <AlertTriangle size={20} className={`${styles.cardIcon} ${styles.warningIcon}`} />
                        <h3>재고 부족 상품/원료</h3>
                    </div>
                    <ul className={styles.itemList}>
                        {lowStockItems.map(item => (
                            <li key={`${item.type}-${item.id}`}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemStock}>{item.stock} left</span>
                                <span className={item.type === 'Product' ? styles.productTag : styles.ingredientTag}>
                                    {item.type}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Fourth Row: Top Performers */}
            <div className={styles.mainGrid}>
                <div className={`${styles.card} ${styles.listCard}`}>
                    <div className={styles.cardHeader}>
                        <Star size={20} className={`${styles.cardIcon} ${styles.starIcon}`} />
                        <h3>베스트셀러 (완제품)</h3>
                    </div>
                    <ul className={styles.itemList}>
                        {bestSellers.map(item => (
                            <li key={item.id}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemSales}>{item.sales.toLocaleString()} sold</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={`${styles.card} ${styles.listCard}`}>
                    <div className={styles.cardHeader}>
                        <Beaker size={20} className={`${styles.cardIcon} ${styles.beakerIcon}`} />
                        <h3>인기 원료 (커스텀)</h3>
                    </div>
                    <ul className={styles.itemList}>
                        {mostUsedIngredients.map(item => (
                            <li key={item.id}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemSales}>{item.usage.toLocaleString()} units used</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
