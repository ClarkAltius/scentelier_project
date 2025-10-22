import React, { useState, useEffect } from 'react';
import styles from './OrderManagement.module.css'; // Assuming you create a CSS module for styling
import { Search, Filter, Eye, Edit, XCircle } from 'lucide-react'; // Import icons

/**
 * OrderManagement Component
 *
 * This component provides an interface for administrators to view and manage customer orders.
 * As the backend is not yet implemented, it uses mock data and placeholder functions.
 * Future development will involve integrating with the backend API to fetch real order data
 * and perform actual order modifications.
 */
function OrderManagement() {
    // === STATE VARIABLES ===

    // Holds the list of orders displayed. Initially populated with mock data.
    // In the future, this will be populated by an API call.
    const [orders, setOrders] = useState([]);

    // Stores the currently selected order for viewing details. `null` if no order is selected.
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Stores the search term entered by the admin.
    const [searchTerm, setSearchTerm] = useState('');

    // Stores the selected filter criteria (e.g., 'All', 'Pending', 'Shipped').
    const [filterStatus, setFilterStatus] = useState('All'); // Example filter state

    // Loading state for asynchronous operations (like fetching data).
    const [isLoading, setIsLoading] = useState(false);

    // Error state to display messages if API calls fail.
    const [error, setError] = useState(null);

    // === MOCK DATA ===
    // Placeholder data representing customer orders.
    // Replace this with an API call in useEffect.
    const mockOrders = [
        {
            id: 101,
            customerName: '홍길동',
            customerEmail: 'hong@example.com',
            orderDate: '2025-10-20',
            totalAmount: 59000,
            status: 'PENDING', // Possible statuses: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
            items: [{ productId: 1, name: 'Midnight Blossom', quantity: 1, price: 59000 }],
            shippingAddress: '서울특별시 강남구 테헤란로 123, 101호'
        },
        {
            id: 102,
            customerName: '김철수',
            customerEmail: 'kim@example.com',
            orderDate: '2025-10-21',
            totalAmount: 96000,
            status: 'SHIPPED',
            items: [{ productId: 2, name: 'Citrus Garden', quantity: 2, price: 48000 }],
            shippingAddress: '부산광역시 해운대구 우동 456, 202호'
        },
        {
            id: 103,
            customerName: '박영희',
            customerEmail: 'park@example.com',
            orderDate: '2025-10-21',
            totalAmount: 67000,
            status: 'DELIVERED',
            items: [{ productId: 3, name: 'Woodland Whisper', quantity: 1, price: 67000 }],
            shippingAddress: '대구광역시 중구 동성로 789, 303호'
        },
        // Add more mock orders as needed
    ];

    // === LIFECYCLE HOOKS ===

    /**
     * useEffect Hook: Fetches orders when the component mounts.
     *
     * Currently, it just sets mock data after a short delay to simulate loading.
     * TODO: Replace this with an actual API call to fetch orders from the backend.
     * Handle loading and error states appropriately.
     * Example:
     * const fetchOrders = async () => {
     * setIsLoading(true);
     * setError(null);
     * try {
     * // Assuming your API endpoint is '/api/admin/orders'
     * // const response = await axios.get(`${API_BASE_URL}/api/admin/orders`);
     * // setOrders(response.data);
     * // --- Mock implementation ---
     * await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
     * setOrders(mockOrders);
     * // --- End Mock ---
     * } catch (err) {
     * console.error("Failed to fetch orders:", err);
     * setError("주문 목록을 불러오는 데 실패했습니다.");
     * setOrders([]); // Clear orders on error
     * } finally {
     * setIsLoading(false);
     * }
     * };
     * fetchOrders();
     */
    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching data
        setTimeout(() => {
            setOrders(mockOrders);
            setIsLoading(false);
        }, 500); // 0.5 second delay
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array means this runs once on mount


    // === EVENT HANDLERS ===

    /**
     * handleSearchChange: Updates the search term state as the admin types.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
     */
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // In a real application, you might want to debounce this input
        // or trigger search/filter logic here or in a separate function.
    };

    /**
     * handleFilterChange: Updates the filter status state when the admin selects a filter option.
     * @param {React.ChangeEvent<HTMLSelectElement>} event - The select change event.
     */
    const handleFilterChange = (event) => {
        setFilterStatus(event.target.value);
        // Trigger filtering logic based on the new status.
    };

    /**
     * handleViewDetails: Sets the selected order to display its details (e.g., in a modal).
     * @param {object} order - The order object to view.
     *
     * TODO: Implement a modal or dedicated view to show comprehensive order details,
     * including items, customer info, shipping address, payment details, etc.
     */
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        console.log("Viewing details for order:", order.id);
        // In a real app, this would likely open a modal:
        // setShowDetailsModal(true);
        alert(`주문 상세 보기:\n주문 번호: ${order.id}\n고객명: ${order.customerName}\n총액: ${order.totalAmount}원\n상태: ${order.status}\n\n(실제 앱에서는 모달 창 등으로 표시됩니다.)`);
    };

    /**
     * handleUpdateStatus: Placeholder for updating the status of an order.
     * @param {number} orderId - The ID of the order to update.
     * @param {string} newStatus - The new status to set (e.g., 'SHIPPED', 'DELIVERED').
     *
     * TODO: Implement API call to the backend to update the order status.
     * Update the local 'orders' state upon successful API response.
     * Provide user feedback (e.g., success message, loading indicator).
     * Consider adding confirmation prompts.
     */
    const handleUpdateStatus = (orderId, newStatus) => {
        console.log(`TODO: Update status of order ${orderId} to ${newStatus}`);
        // Example state update (optimistic or after API success):
        // setOrders(prevOrders =>
        //     prevOrders.map(order =>
        //         order.id === orderId ? { ...order, status: newStatus } : order
        //     )
        // );
        alert(`[Placeholder] 주문 #${orderId} 상태를 ${newStatus}(으)로 변경합니다.`);
    };

    /**
     * handleCancelOrder: Placeholder for cancelling an order.
     * @param {number} orderId - The ID of the order to cancel.
     *
     * TODO: Implement API call to the backend to cancel the order.
     * Handle potential refund logic if applicable.
     * Update the local 'orders' state (e.g., set status to 'CANCELLED' or remove).
     * Provide user feedback and confirmation prompts.
     */
    const handleCancelOrder = (orderId) => {
        if (window.confirm(`정말로 주문 #${orderId}을(를) 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            console.log(`TODO: Cancel order ${orderId}`);
            // Example state update:
            // setOrders(prevOrders =>
            //     prevOrders.map(order =>
            //         order.id === orderId ? { ...order, status: 'CANCELLED' } : order
            //     )
            // );
            alert(`[Placeholder] 주문 #${orderId}을(를) 취소합니다.`);
        }
    };


    // === DERIVED STATE & FILTERING/SEARCHING LOGIC ===

    /**
     * Filtered and Searched Orders: Computes the list of orders to display
     * based on the current filter status and search term.
     *
     * TODO: Enhance filtering logic (e.g., filter by date range, customer).
     * Improve search logic (e.g., search across multiple fields like name, email, product).
     */
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        const matchesSearch = searchTerm === '' ||
            order.id.toString().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });


    // === RENDER LOGIC ===

    // Display loading indicator while fetching data.
    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    // Display error message if fetching failed.
    if (error) {
        return <div className={styles.error}>에러: {error}</div>;
    }

    return (
        <div className={styles.orderManagementPage}>
            {/* Header in TopBar.js */}
            {/* Filter and Search Controls */}
            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, Email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className={styles.filterDropdown}>
                    <Filter size={16} />
                    <select value={filterStatus} onChange={handleFilterChange}>
                        <option value="All">모든 상태</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Order Table */}
            <div className={styles.tableContainer}>
                <table className={styles.orderTable}>
                    <thead>
                        <tr>
                            <th>주문 ID</th>
                            <th>고객</th>
                            <th>날짜</th>
                            <th>합계</th>
                            <th>상태</th>
                            <th>행동</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>
                                        <div>{order.customerName}</div>
                                        <div className={styles.customerEmail}>{order.customerEmail}</div>
                                    </td>
                                    <td>{order.orderDate}</td>
                                    <td>₩{order.totalAmount.toLocaleString()}</td>
                                    <td>
                                        {/* Display status with visual indicator */}
                                        <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            {/* Button to view order details */}
                                            <button
                                                className={`${styles.actionButton} ${styles.viewButton}`}
                                                onClick={() => handleViewDetails(order)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            {/* Example: Button to mark as 'Shipped' if 'Pending' or 'Paid' */}
                                            {(order.status === 'PENDING' || order.status === 'PAID') && (
                                                <button
                                                    className={`${styles.actionButton} ${styles.updateButton}`}
                                                    onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                                                    title="Mark as Shipped"
                                                >
                                                    <Edit size={16} /> Mark Shipped
                                                </button>
                                            )}
                                            {/* Example: Button to mark as 'Delivered' if 'Shipped' */}
                                            {order.status === 'SHIPPED' && (
                                                <button
                                                    className={`${styles.actionButton} ${styles.updateButton}`}
                                                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                    title="Mark as Delivered"
                                                >
                                                    <Edit size={16} /> Mark Delivered
                                                </button>
                                            )}

                                            {/* Button to cancel the order (conditionally shown) */}
                                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                                <button
                                                    className={`${styles.actionButton} ${styles.cancelButton}`}
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    title="Cancel Order"
                                                >
                                                    <XCircle size={16} /> Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className={styles.noResults}>검색 결과가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* TODO: Add Pagination controls here if the order list can be long */}

            {/* TODO: Implement a Modal component for viewing order details */}
            {/* {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdateStatus={handleUpdateStatus} // Pass update handler to modal if needed
                />
            )} */}
        </div>
    );
}

export default OrderManagement;