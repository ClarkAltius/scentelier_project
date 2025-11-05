import React, { useState, useEffect } from 'react';
import styles from './OrderManagement.module.css';
import { Search, Filter, Eye, Edit, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Pagination, Modal, Button, Form } from 'react-bootstrap';
import { API_BASE_URL } from '../config/config';
import axios from 'axios';
import OrderDetailsModal from './OrderDetailsModal';


/**
 * OrderManagement Component
 *
 */
function OrderManagement() {
    // === 스테이트 변수 ===
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

    // 모달 표기용 스테이트
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // 페이징, 정렬 용 스테이트 추가
    const [sortConfig, setSortConfig] = useState({ key: 'orderDate', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    // 배송 상태 모달 용 스테이트
    const [showShipModal, setShowShipModal] = useState(false);
    const [orderToShip, setOrderToShip] = useState(null);
    const [trackingInput, setTrackingInput] = useState('');


    //주문 리스트 가져오기. UPDATE : 페이징, 정렬 기능 추가
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 페이징과 정렬 기능을 위한 쿼리 파라미터
                const params = new URLSearchParams();
                params.append('page', currentPage);
                params.append('size', pageSize);
                params.append('sort', `${sortConfig.key},${sortConfig.direction}`);

                const response = await axios.get(`${API_BASE_URL}/api/admin/orders?${params.toString()}`, { withCredentials: true });
                // console.log(response.data);
                setOrders(response.data.content || []);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError("주문 목록을 불러오는 데 실패했습니다.");
                setOrders([]); // Clear orders on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [currentPage, sortConfig, pageSize]);


    // === EVENT HANDLERS ===


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };


    const handleFilterChange = (event) => {
        setFilterStatus(event.target.value);
    };


    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedOrder(null);
    };

    // 정렬 기능 핸들러
    const handleSort = (key) => {
        let direction = 'asc';
        // 같은 키를 누르면 정렬 옵션 반대로
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        // 정렬이 바뀌면 첫번째 페이지로 리셋. 0base
        setCurrentPage(0);
        setSortConfig({ key, direction });
    };

    // 배송, 운송장 번호 관련 모달
    const handleOpenShipModal = (order) => {
        setOrderToShip(order);
        setTrackingInput(order.trackingNumber || ''); // Pre-fill if it already exists
        setShowShipModal(true);
    };

    const handleCloseShipModal = () => {
        setShowShipModal(false);
        setOrderToShip(null);
        setTrackingInput('');
    };

    const handleConfirmShipment = async () => {
        if (!trackingInput) {
            alert("송장번호를 입력해주세요.");
            return;
        }

        await handleUpdateStatus(orderToShip.id, 'SHIPPED', trackingInput);

        handleCloseShipModal();
    };


    // [모달] 상태 변경 핸들러
    const handleUpdateStatus = async (orderId, newStatus, trackingNumber = null) => {
        if (!window.confirm(`정말로 #${orderId}의 상태를 ${newStatus}로 변경하시겠습니다?`)) {
            return;
        }

        const payload = { status: newStatus };
        if (trackingNumber) {
            payload.trackingNumber = trackingNumber;
        }

        try {
            const response = await axios.patch(
                `${API_BASE_URL}/api/admin/orders/${orderId}`,
                payload,
                { withCredentials: true }
            );
            const updatedOrderFromServer = response.data;

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? updatedOrderFromServer : order
                )
            );
            alert(`주문 #${orderId} 상태가 ${newStatus}(으)로 변경되었습니다.`);
        } catch (err) {
            console.log("상태 변경 실패: " + err);
            alert("주문 상태 변경에 실패했습니다.");
        }
    };

    // 주문 취소 로직
    const handleCancelOrder = async (orderId) => {
        if (window.confirm(`정말로 주문 #${orderId}을(를) 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            const newStatus = "CANCELLED";
            const payload = { status: newStatus };

            try {
                await axios.patch(
                    `${API_BASE_URL}/api/admin/orders/${orderId}`,
                    payload,
                    { withCredentials: true });

                // API 콜이 성공적일 경우 로컬 스테이트 업데이트
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId ? { ...order, status: newStatus } : order
                    )
                );
                alert(`주문 #${orderId}이(가) 취소되었습니다.`);
            } catch (err) {
                console.error("Failed to cancel order:", err);
                alert("주문 취소에 실패했습니다. 서버 오류가 발생했습니다.");
            };
        };
    }


    // === DERIVED STATE & FILTERING/SEARCHING LOGIC ===
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        const matchesSearch = searchTerm === '' ||
            order.id.toString().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // 정렬 화살표 헬퍼
    const getSortArrow = (key) => {
        if (sortConfig.key !== key) return null;
        if (sortConfig.direction === 'asc') {
            return <ArrowUp size={16} className={styles.sortIcon} />;
        }
        return <ArrowDown size={16} className={styles.sortIcon} />;
    };

    // === 렌더링 로직 ===

    // 데이터 fetch 도중엔 로딩 표기

    if (isLoading && !orders.length) {
        return <div className={styles.loading}>Loading products...</div>;
    }
    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.orderManagementPage}>
            {/* Header in TopBar.js */}
            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="ID, Name, Email... 검색"
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
            {isLoading && <div className={styles.loadingOverlay}></div>} {/** 정렬, 페이징 변경시 재로딩  */}
            <div className={styles.tableContainer}>
                <table className={styles.orderTable}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} className={styles.sortableHeader}>
                                주문 ID{getSortArrow('id')}
                            </th>
                            <th onClick={() => handleSort('recipientName')} className={styles.sortableHeader}>
                                고객 {getSortArrow('recipientName')}
                            </th>
                            <th onClick={() => handleSort('orderDate')} className={styles.sortableHeader}>
                                날짜 {getSortArrow('orderDate')}
                            </th>
                            <th onClick={() => handleSort('totalPrice')} className={styles.sortableHeader}>
                                합계 {getSortArrow('totalPrice')}
                            </th>
                            <th onClick={() => handleSort('address')} className={styles.sortableHeader}>
                                주소 {getSortArrow('address')}
                            </th>
                            <th onClick={() => handleSort('trackingNumber')} className={styles.sortableHeader}>
                                운송장 {getSortArrow('trackingNumber')}
                            </th>
                            <th onClick={() => handleSort('status')} className={styles.sortableHeader}>
                                상태 {getSortArrow('status')}
                            </th>
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
                                    <td>{order.address}</td>
                                    <td>{order.trackingNumber}</td>
                                    <td>
                                        {/* 상태 + 상태 아이콘 표시*/}
                                        <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            {/* 상세 보기 버튼. 기능 구현 필요 */}
                                            <button
                                                className={`${styles.actionButton} ${styles.viewButton}`}
                                                onClick={() => handleViewDetails(order)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            {(order.status === 'PENDING' || order.status === 'PAID') && (
                                                <button
                                                    className={`${styles.actionButton} ${styles.updateButton}`}
                                                    onClick={() => handleOpenShipModal(order)}
                                                    title="Mark as Shipped"
                                                >
                                                    <Edit size={16} /> Mark Shipped
                                                </button>
                                            )}
                                            {order.status === 'SHIPPED' && (
                                                <button
                                                    className={`${styles.actionButton} ${styles.updateButton}`}
                                                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                    title="Mark as Delivered"
                                                >
                                                    <Edit size={16} /> Mark Delivered
                                                </button>
                                            )}

                                            {/* 주문 취소하기. change status to cancelled. this is a patch */}
                                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                                <button
                                                    className={`${styles.actionButton} ${styles.cancelButton}`}
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    title="Cancel Order"
                                                >
                                                    <XCircle size={16} /> 취소
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

            {/* TODO: 페이징 처리 여기에 추가 */}
            <div className={styles.paginationContainer}>
                <Pagination>
                    <Pagination.Prev
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                        disabled={currentPage === 0}
                    />
                    <Pagination.Item active>{currentPage + 1}</Pagination.Item>
                    <Pagination.Next
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                        disabled={currentPage >= totalPages - 1}
                    />
                </Pagination>
            </div>

            <OrderDetailsModal
                order={selectedOrder}
                show={showDetailsModal}
                handleClose={handleCloseModal}
                onCancelOrder={handleCancelOrder}
            />
            <Modal show={showShipModal} onHide={handleCloseShipModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>송장번호 입력 (주문 #{orderToShip?.id})</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="trackingNumberInput">
                        <Form.Label>송장 번호</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="송장번호를 입력하세요..."
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseShipModal}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleConfirmShipment}>
                        'SHIPPED'로 변경 및 저장
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default OrderManagement;