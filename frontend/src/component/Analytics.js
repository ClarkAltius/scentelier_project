import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    Calendar,
    Filter,
    DollarSign,
    Users,
    Package,
    Star,
    Beaker,
    ShoppingCart,
    SlidersHorizontal,
    PieChart as PieChartIcon
} from 'lucide-react';
import styles from './Analytics.module.css';

// Import all API functions
import {
    getSalesOverTime,
    getAovOverTime,
    getCustomerBreakdown,
    getSalesByCategory,
    getPopularIngredients,
    getProductPerformance,
    getTopCustomers
} from '../api/AnalyticsApi.js';

/**
 * Helper to convert date range string to actual Date objects for the API
 */
const getDateRangeFromValue = (rangeValue) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (rangeValue) {
        case 'last_90_days':
            startDate.setDate(endDate.getDate() - 90);
            break;
        case 'this_year':
            startDate.setFullYear(endDate.getFullYear(), 0, 1);
            break;
        case 'last_30_days':
        default:
            startDate.setDate(endDate.getDate() - 30);
            break;
    }
    return { startDate, endDate };
};


// --- MAIN ANALYTICS COMPONENT ---

function Analytics() {
    // --- STATE ---
    const [dateRange, setDateRange] = useState('last_30_days');
    const [productType, setProductType] = useState('all');
    // In a real app, this could also be populated from the API
    const [categories, setCategories] = useState(['Floral', 'Woody', 'Citrus', 'Oriental']);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- DATA FETCHING EFFECT ---
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get date objects from state
                const { startDate, endDate } = getDateRangeFromValue(dateRange);

                // Fetch all data in parallel
                const [
                    salesOverTime,
                    aovOverTime,
                    customerBreakdown,
                    salesByCategory,
                    popularIngredients,
                    productPerformance,
                    topCustomers
                ] = await Promise.all([
                    getSalesOverTime(startDate, endDate, productType),
                    getAovOverTime(startDate, endDate),
                    getCustomerBreakdown(startDate, endDate),
                    getSalesByCategory(startDate, endDate, productType),
                    getPopularIngredients(startDate, endDate),
                    getProductPerformance(startDate, endDate, productType, selectedCategories.length > 0 ? selectedCategories : null),
                    getTopCustomers(startDate, endDate)
                ]);

                // Set all data into state
                setAnalyticsData({
                    salesOverTime,
                    aovOverTime,
                    customerBreakdown,
                    salesByCategory,
                    popularIngredients,
                    productPerformance,
                    topCustomers
                });

            } catch (err) {
                console.error("Failed to fetch analytics data:", err);
                setError("Failed to load analytics data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [dateRange, productType, selectedCategories]); // Refetch when filters change

    // --- MEMOIZED COLORS ---
    const PIE_COLORS = useMemo(() => ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'], []);

    // --- RENDER LOGIC ---
    if (loading) {
        return <div className={styles.loadingOverlay}>Loading analytics...</div>;
    }

    if (error) {
        return <div className={styles.errorOverlay}>{error}</div>;
    }

    if (!analyticsData) {
        return <div className={styles.loadingOverlay}>No analytics data found.</div>;
    }

    // --- JSX ---
    return (
        <div className={styles.analyticsPage}>
            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label htmlFor="date-range-select">
                        <Calendar size={12} /> Date Range
                    </label>
                    <select
                        id="date-range-select"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="last_30_days">Last 30 Days</option>
                        <option value="last_90_days">Last 90 Days</option>
                        <option value="this_year">This Year</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="product-type-select">
                        <Filter size={12} /> Product Type
                    </label>
                    <select
                        id="product-type-select"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                    >
                        <option value="all">All Products</option>
                        <option value="finished">Finished Products</option>
                        <option value="custom">Custom Perfumes</option>
                    </select>
                </div>

                {/* This is a placeholder. A real implementation would use a multi-select dropdown library */}
                <div className={styles.filterGroup}>
                    <label>Categories</label>
                    <button className={styles.filterButton} onClick={() => alert('Category filter modal would open here.')}>
                        <SlidersHorizontal size={14} />
                        Filter Categories ({selectedCategories.length} selected)
                    </button>
                </div>
            </div>

            {/* Main Analytics Grid */}
            <div className={styles.analyticsGrid}>

                {/* Sales Over Time */}
                <div className={styles.analyticsCard}>
                    <h3><DollarSign size={18} /> Sales Over Time</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.salesOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis
                                    tickFormatter={(value) => `₩${(value / 10000).toFixed(0)}만`}
                                    fontSize={12}
                                />
                                <Tooltip formatter={(value) => [`₩${value.toLocaleString()}`, "Sales"]} />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AOV Over Time */}
                <div className={styles.analyticsCard}>
                    <h3><ShoppingCart size={18} /> Average Order Value (AOV)</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.aovOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis
                                    tickFormatter={(value) => `₩${(value / 10000).toFixed(0)}만`}
                                    fontSize={12}
                                />
                                <Tooltip formatter={(value) => [`₩${value.toLocaleString()}`, "AOV"]} />
                                <Legend />
                                <Line type="monotone" dataKey="aov" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Customer Breakdown */}
                <div className={styles.analyticsCard}>
                    <h3><Users size={18} /> New vs. Returning Customers</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.customerBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="newCustomers" stackId="a" fill="#8b5cf6" name="New Customers" />
                                <Bar dataKey="returningCustomers" stackId="a" fill="#ec4899" name="Returning Customers" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales by Category Pie Chart */}
                <div className={styles.analyticsCard}>
                    <h3><PieChartIcon size={18} /> Sales by Category</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analyticsData.salesByCategory}
                                    dataKey="revenue"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {analyticsData.salesByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₩${value.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Ingredients (Only shows if 'custom' or 'all' is selected) */}
                {(productType === 'all' || productType === 'custom') && (
                    <div className={`${styles.analyticsCard} ${styles.fullWidth}`}>
                        <h3><Beaker size={18} /> Popular Ingredients (Custom Perfumes)</h3>
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData.popularIngredients} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" fontSize={12} />
                                    <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                                    <Tooltip formatter={(value) => [value, "Usage Count"]} />
                                    <Legend />
                                    <Bar dataKey="usage" fill="#f59e0b" name="Usage Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Product Performance Table */}
                <div className={`${styles.analyticsCard} ${styles.fullWidth}`}>
                    <h3><Package size={18} /> Product Performance</h3>
                    <div className={styles.tableContainer}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Season</th>
                                    <th>Units Sold</th>
                                    <th>Total Revenue</th>
                                    <th>Avg. Rating</th>
                                    <th>Re-purchase Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.productPerformance.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.name}</td>
                                        <td>{product.category}</td>
                                        <td>{product.season}</td>
                                        <td>{product.unitsSold}</td>
                                        <td>₩{product.revenue.toLocaleString()}</td>
                                        <td className={styles.ratingCell}>
                                            {product.avgRating.toFixed(1)} <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                        </td>
                                        <td>{(product.rePurchaseRate * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Customers Table */}
                <div className={`${styles.analyticsCard} ${styles.fullWidth}`}>
                    <h3><Users size={18} /> Top Customers</h3>
                    <div className={styles.tableContainer}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>User Email</th>
                                    <th>Total Orders</th>
                                    <th>Total Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.topCustomers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>{customer.email}</td>
                                        <td>{customer.totalOrders}</td>
                                        <td>₩{customer.totalSpent.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Analytics;