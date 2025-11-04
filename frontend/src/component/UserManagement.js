import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import styles from './UserManagement.module.css';
import { Pagination, Table, Badge, Button, Form, Modal, Spinner, Row, Col, Card, Alert, InputGroup } from 'react-bootstrap';
import { Search, ArrowLeft, Edit, User, Mail, Phone, MapPin, Calendar, DollarSign, List, Filter, Trash, UserCheck, UserX, Info, ArrowUp, ArrowDown } from 'lucide-react';

// Helper to get a status badge
const getStatusBadge = (status) => {
    const variant = {
        'ACTIVE': 'success',
        'INACTIVE': 'danger',
    }[status] || 'secondary';
    return <Badge bg={variant}>{status}</Badge>;
};

function UserManagement() {
    // === STATE ===

    // View Management
    const [selectedUser, setSelectedUser] = useState(null); // If null, show list. If set, show detail.

    // List State
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // List Controls (Pagination, Sorting, Filtering)
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // 'ACTIVE', 'INACTIVE', or ''

    // Detail View State
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersCurrentPage, setOrdersCurrentPage] = useState(0);
    const [ordersTotalPages, setOrdersTotalPages] = useState(0);

    // Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    // === API CALLS & EFFECTS ===

    // Debounce search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // Fetch User List
    useEffect(() => {
        if (selectedUser) return; // Don't fetch list when viewing details

        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.append('page', currentPage);
                params.append('size', pageSize);
                params.append('sort', `${sortConfig.key},${sortConfig.direction}`);
                if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
                if (statusFilter) params.append('status', statusFilter);

                const url = `${API_BASE_URL}/api/admin/users?${params.toString()}`;
                const response = await axios.get(url, { withCredentials: true });

                setUsers(response.data.content || []);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError("사용자 목록을 불러오는 데 실패했습니다.");
                setUsers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage, pageSize, sortConfig, debouncedSearchTerm, statusFilter, selectedUser]);

    // Fetch User Details (when a user is selected)
    useEffect(() => {
        if (!selectedUser?.id) return;

        const fetchDetails = async () => {
            setDetailLoading(true);
            setDetailError(null);
            try {
                const url = `${API_BASE_URL}/api/admin/users/${selectedUser.id}`;
                const response = await axios.get(url, { withCredentials: true });
                setSelectedUser(response.data); // Update with full stats
            } catch (err) {
                console.error("Failed to fetch user details:", err);
                setDetailError("사용자 상세 정보를 불러오는 데 실패했습니다.");
            } finally {
                setDetailLoading(false);
            }
        };

        fetchDetails();
    }, [selectedUser?.id]); // Only refetch if ID changes

    // Fetch User's Orders
    useEffect(() => {
        if (!selectedUser?.id) return;

        const fetchOrders = async () => {
            setOrdersLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('page', ordersCurrentPage);
                params.append('size', 5); // Smaller page size for detail view
                params.append('sort', 'orderDate,desc');

                const url = `${API_BASE_URL}/api/admin/users/${selectedUser.id}/orders?${params.toString()}`;
                const response = await axios.get(url, { withCredentials: true });

                setUserOrders(response.data.content || []);
                setOrdersTotalPages(response.data.totalPages);
            } catch (err) {
                console.error("Failed to fetch user orders:", err);
                setDetailError("사용자 주문 내역을 불러오는 데 실패했습니다.");
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchOrders();
    }, [selectedUser?.id, ordersCurrentPage]);

    // === HANDLERS ===
    const getSortArrow = (key) => {
        if (sortConfig.key !== key) {
            // Optional: add a subtle placeholder to show it's sortable
            // return <ArrowDown size={16} className={styles.sortIconPlaceholder} />;
            return null;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowUp size={16} className={styles.sortIcon} />;
        }
        return <ArrowDown size={16} className={styles.sortIcon} />;
    };
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(0);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleOrdersPageChange = (page) => {
        setOrdersCurrentPage(page);
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setOrdersCurrentPage(0); // Reset orders page
    };

    const handleBackToList = () => {
        setSelectedUser(null);
        setError(null);
        setDetailError(null);
    };

    // Edit Modal Handlers
    const handleOpenEditModal = (user) => {
        setUserToEdit({ ...user }); // Clone user to edit
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setUserToEdit(null);
    };

    const handleSaveChanges = async () => {
        if (!userToEdit) return;

        try {
            const payload = {
                username: userToEdit.username,
                phone: userToEdit.phone,
                address: userToEdit.address,
                role: userToEdit.role,
            };
            const url = `${API_BASE_URL}/api/admin/users/${userToEdit.id}`;
            const response = await axios.patch(url, payload, { withCredentials: true });

            // Update state in both list and detail view
            const updatedUser = response.data;
            setSelectedUser(updatedUser); // Update detail view
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u)); // Update list view

            handleCloseEditModal();
        } catch (err) {
            console.error("Failed to update user:", err);
            alert("사용자 정보 업데이트에 실패했습니다.");
        }
    };

    // Status Modal Handlers
    const handleOpenStatusModal = (user, status) => {
        setUserToEdit(user);
        setNewStatus(status);
        setShowStatusModal(true);
    };

    const handleCloseStatusModal = () => {
        setShowStatusModal(false);
        setUserToEdit(null);
        setNewStatus('');
    };

    const handleChangeStatus = async () => {
        if (!userToEdit || !newStatus) return;

        try {
            const payload = { status: newStatus };
            const url = `${API_BASE_URL}/api/admin/users/${userToEdit.id}/status`;
            const response = await axios.patch(url, payload, { withCredentials: true });

            const updatedUser = response.data;
            setSelectedUser(updatedUser); // Update detail view
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u)); // Update list view

            handleCloseStatusModal();
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("상태 변경에 실패했습니다.");
        }
    };

    // === RENDER FUNCTIONS ===

    const renderPagination = (currentPage, totalPages, onPageChange) => {
        if (totalPages <= 1) return null;
        return (
            <Pagination className={styles.paginationContainer}>
                <Pagination.Prev onClick={() => onPageChange(Math.max(currentPage - 1, 0))} disabled={currentPage === 0} />
                <Pagination.Item active>{currentPage + 1}</Pagination.Item>
                <Pagination.Next onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))} disabled={currentPage >= totalPages - 1} />
            </Pagination>
        );
    };

    const renderUserList = () => (
        <>
            <div className={styles.controls}>
                <InputGroup className={styles.searchBar}>
                    <InputGroup.Text><Search size={18} /></InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="사용자 이름, 이메일로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
                <InputGroup className={styles.filterDropdown}>
                    <InputGroup.Text><Filter size={16} /></InputGroup.Text>
                    <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">모든 상태</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </Form.Select>
                </InputGroup>
            </div>

            {isLoading && <div className="text-center p-5"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{error}</Alert>}

            {!isLoading && !error && (
                <div className={styles.tableContainer}>
                    <Table striped bordered hover responsive="sm">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')} className={styles.sortableHeader}>
                                    ID {getSortArrow('id')}
                                </th>
                                <th onClick={() => handleSort('username')} className={styles.sortableHeader}>
                                    사용자 {getSortArrow('username')}
                                </th>
                                <th onClick={() => handleSort('isDeleted')} className={styles.sortableHeader}>
                                    상태 {getSortArrow('isDeleted')}
                                </th>
                                <th onClick={() => handleSort('totalOrders')} className={styles.sortableHeader}>
                                    총 주문 {getSortArrow('totalOrders')}
                                </th>
                                <th onClick={() => handleSort('totalExpenditure')} className={styles.sortableHeader}>
                                    총 지출 {getSortArrow('totalExpenditure')}
                                </th>
                                <th onClick={() => handleSort('createdAt')} className={styles.sortableHeader}>
                                    가입일 {getSortArrow('createdAt')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>
                                        <div>{user.username}</div>
                                        <small className="text-muted">{user.email}</small>
                                    </td>
                                    <td>{getStatusBadge(user.status)}</td>
                                    <td>{user.totalOrders}</td>
                                    <td>₩{user.totalExpenditure.toLocaleString()}</td>
                                    <td>{user.createdAt}</td>
                                    <td>
                                        <Button variant="link" onClick={() => handleViewDetails(user)} title="View Details">
                                            <List size={18} />
                                        </Button>
                                        <Button variant="link" onClick={() => handleOpenEditModal(user)} title="Edit User">
                                            <Edit size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center">사용자가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
            {renderPagination(currentPage, totalPages, handlePageChange)}
        </>
    );

    const renderUserDetail = () => {
        if (detailLoading && !selectedUser.totalOrders) return <div className="text-center p-5"><Spinner animation="border" /></div>;
        if (detailError) return <Alert variant="danger">{detailError}</Alert>;
        if (!selectedUser) return null;

        const user = selectedUser; // Use the fully loaded user

        return (
            <div className={styles.detailView}>
                <Button variant="link" onClick={handleBackToList} className={styles.backButton}>
                    <ArrowLeft size={18} /> 모든 사용자 목록으로
                </Button>

                {/* --- User Summary Card --- */}
                <Card className="mb-4">
                    <Card.Header>
                        <Row>
                            <Col md={8}>
                                <h4 className="mb-0">{user.username} {getStatusBadge(user.status)}</h4>
                                <div className="text-muted">{user.email}</div>
                            </Col>
                            <Col md={4} className="text-md-end">
                                <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditModal(user)} className="me-2">
                                    <Edit size={16} /> 정보 수정
                                </Button>
                                {user.status === 'ACTIVE' ? (
                                    <Button variant="outline-danger" size="sm" onClick={() => handleOpenStatusModal(user, 'INACTIVE')}>
                                        <UserX size={16} /> 비활성화
                                    </Button>
                                ) : (
                                    <Button variant="outline-success" size="sm" onClick={() => handleOpenStatusModal(user, 'ACTIVE')}>
                                        <UserCheck size={16} /> 활성화
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={4}>
                                <h5><User size={18} /> 고객 정보</h5>
                                <p><Mail size={16} /> {user.email}</p>
                                <p><Phone size={16} /> {user.phone || 'N/A'}</p>
                                <p><MapPin size={16} /> {user.address || 'N/A'}</p>
                            </Col>
                            <Col md={4} className={styles.statCol}>
                                <h5><DollarSign size={18} /> 구매 정보</h5>
                                <p><strong>총 지출:</strong> ₩{user.totalExpenditure.toLocaleString()}</p>
                                <p><strong>총 주문:</strong> {user.totalOrders} 건</p>
                            </Col>
                            <Col md={4} className={styles.statCol}>
                                <h5><Info size={18} /> 계정 정보</h5>
                                <p><strong>역할:</strong> {user.role}</p>
                                <p><strong>가입일:</strong> {user.createdAt}</p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* --- User Order History --- */}
                <Card>
                    <Card.Header>
                        <h5>주문 내역 ({user.totalOrders} 건)</h5>
                    </Card.Header>
                    <Card.Body>
                        {ordersLoading && <div className="text-center p-3"><Spinner animation="border" size="sm" /></div>}
                        {!ordersLoading && userOrders.length > 0 ? (
                            <Table striped hover size="sm">
                                <thead>
                                    <tr>
                                        <th>주문 ID</th>
                                        <th>날짜</th>
                                        <th>상태</th>
                                        <th>주소</th>
                                        <th>총액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{order.orderDate}</td>
                                            <td>{order.status}</td>
                                            <td>{order.address}</td>
                                            <td>₩{order.totalAmount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            !ordersLoading && <p className="text-muted">이 사용자의 주문 내역이 없습니다.</p>
                        )}
                        {renderPagination(ordersCurrentPage, ordersTotalPages, handleOrdersPageChange)}
                    </Card.Body>
                </Card>
            </div>
        );
    };

    // === MAIN RETURN ===
    return (
        <div className={styles.userManagementPage}>
            {selectedUser ? renderUserDetail() : renderUserList()}

            {/* --- Edit User Modal --- */}
            {userToEdit && (
                <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>사용자 정보 수정 (ID: {userToEdit.id})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3" controlId="formUsername">
                                <Form.Label>이름</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={userToEdit.username}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, username: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formPhone">
                                <Form.Label>연락처</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={userToEdit.phone || ''}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, phone: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formAddress">
                                <Form.Label>주소</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={userToEdit.address || ''}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, address: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formRole">
                                <Form.Label>역할</Form.Label>
                                <Form.Select
                                    value={userToEdit.role}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value })}
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditModal}>취소</Button>
                        <Button variant="primary" onClick={handleSaveChanges}>저장</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* --- Change Status Modal --- */}
            {userToEdit && (
                <Modal show={showStatusModal} onHide={handleCloseStatusModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>상태 변경 확인</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>정말로 <strong>{userToEdit.username}</strong> 계정을 <strong>{newStatus}</strong>(으)로 변경하시겠습니까?</p>
                        {newStatus === 'INACTIVE' && (
                            <Alert variant="warning">
                                <strong>주의:</strong> 계정이 비활성화되면 해당 사용자는 로그인할 수 없습니다.
                            </Alert>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseStatusModal}>취소</Button>
                        <Button variant={newStatus === 'INACTIVE' ? 'danger' : 'success'} onClick={handleChangeStatus}>
                            {newStatus === 'INACTIVE' ? '비활성화' : '활성화'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
}

export default UserManagement;