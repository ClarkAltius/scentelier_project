import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import styles from './ReviewManagement.module.css';
import { Pagination, Table, Badge, Button, Form, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { Search, Filter, Star, Eye, Trash2, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import ReviewDetailsModal from './ReviewDetailsModal'; // We'll create this next

// Helper to render star ratings
const StarRating = ({ rating }) => {
    return (
        <div className={styles.starRating}>
            {[...Array(5)].map((_, index) => (
                <Star
                    key={index}
                    size={16}
                    className={index < rating ? styles.starFilled : styles.starEmpty}
                />
            ))}
        </div>
    );
};

function ReviewManagement() {
    // === STATE ===
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // List Controls
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState(-1); // -1 for "All Ratings"
    const [statusFilter, setStatusFilter] = useState(''); // '', 'VISIBLE', 'DELETED'

    // Modal State
    const [selectedReview, setSelectedReview] = useState(null); // For the detail modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // === API CALLS & EFFECTS ===

    // Debounce search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // Fetch Reviews
    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.append('page', currentPage);
                params.append('size', pageSize);
                params.append('sort', `${sortConfig.key},${sortConfig.direction}`);
                if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
                if (ratingFilter !== -1) params.append('rating', ratingFilter);
                if (statusFilter) params.append('status', statusFilter);

                const url = `${API_BASE_URL}/api/admin/reviews?${params.toString()}`;
                const response = await axios.get(url, { withCredentials: true });

                setReviews(response.data.content || []);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
                setError("리뷰 목록을 불러오는 데 실패했습니다.");
                setReviews([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [currentPage, pageSize, sortConfig, debouncedSearchTerm, ratingFilter, statusFilter]);

    // === HANDLERS ===

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

    // Toggle (Delete/Restore) Review Status
    const handleToggleStatus = async (review, newStatus) => {
        const action = newStatus ? "삭제" : "복원";
        if (!window.confirm(`정말로 이 리뷰를 ${action}하시겠습니까?`)) {
            return;
        }

        try {
            const payload = { isDeleted: newStatus };
            const url = `${API_BASE_URL}/api/admin/reviews/${review.reviewId}/status`;
            const response = await axios.patch(url, payload, { withCredentials: true });

            const updatedReview = response.data;
            // // de----bugggg start ===========================
            // console.log("Review sent to server:", review);
            // console.log("Payload sent:", payload);
            // console.log("Response from server (updatedReview):", updatedReview);
            // // de----bugggg end===============================
            setReviews(prev => prev.map(r => r.reviewId === updatedReview.reviewId ? updatedReview : r));
            alert(`리뷰가 ${action}되었습니다.`);
        } catch (err) {
            console.error(`Failed to ${action} review:`, err);
            alert(`리뷰 ${action}에 실패했습니다.`);
        }
    };

    // Modal Handlers
    const handleOpenDetails = (review) => {
        setSelectedReview(review);
        setShowDetailsModal(true);
    };

    const handleCloseDetails = () => {
        setShowDetailsModal(false);
        setSelectedReview(null);
    };

    // === RENDER ===

    const getSortArrow = (key) => {
        if (sortConfig.key !== key) return null;
        if (sortConfig.direction === 'asc') {
            return <ArrowUp size={16} className={styles.sortIcon} />;
        }
        return <ArrowDown size={16} className={styles.sortIcon} />;
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        return (
            <Pagination className={styles.paginationContainer}>
                <Pagination.Prev onClick={() => handlePageChange(Math.max(currentPage - 1, 0))} disabled={currentPage === 0} />
                <Pagination.Item active>{currentPage + 1}</Pagination.Item>
                <Pagination.Next onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages - 1))} disabled={currentPage >= totalPages - 1} />
            </Pagination>
        );
    };

    return (
        <div className={styles.reviewManagementPage}>
            {/* --- Controls --- */}
            <div className={styles.controls}>
                <InputGroup className={styles.searchBar}>
                    <InputGroup.Text><Search size={18} /></InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="리뷰 내용, 사용자, 주문 ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <InputGroup className={styles.filterDropdown}>
                    <InputGroup.Text><Star size={16} /></InputGroup.Text>
                    <Form.Select value={ratingFilter} onChange={(e) => setRatingFilter(Number(e.target.value))}>
                        <option value={-1}>모든 별점</option>
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={2}>2 Stars</option>
                        <option value={1}>1 Star</option>
                    </Form.Select>
                </InputGroup>

                <InputGroup className={styles.filterDropdown}>
                    <InputGroup.Text><Filter size={16} /></InputGroup.Text>
                    <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">모든 상태</option>
                        <option value="VISIBLE">Visible</option>
                        <option value="DELETED">Deleted</option>
                    </Form.Select>
                </InputGroup>
            </div>

            {/* --- Table --- */}
            {isLoading && <div className="text-center p-5"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{error}</Alert>}

            {!isLoading && !error && (
                <div className={styles.tableContainer}>
                    <Table striped bordered hover responsive="sm">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('createdAt')} className={styles.sortableHeader}>
                                    날짜 {getSortArrow('createdAt')}
                                </th>
                                <th onClick={() => handleSort('user.username')} className={styles.sortableHeader}>
                                    사용자 {getSortArrow('user.username')}
                                </th>
                                <th onClick={() => handleSort('order.id')} className={styles.sortableHeader}>
                                    주문 ID {getSortArrow('order.id')}
                                </th>
                                <th onClick={() => handleSort('rating')} className={styles.sortableHeader}>
                                    별점 {getSortArrow('rating')}
                                </th>
                                <th>내용</th>
                                <th onClick={() => handleSort('isDeleted')} className={styles.sortableHeader}>
                                    상태 {getSortArrow('isDeleted')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.length > 0 ? reviews.map(review => (
                                <tr key={review.reviewId}>
                                    <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div>{review.username}</div>
                                        <small className="text-muted">{review.userEmail}</small>
                                    </td>
                                    <td>#{review.orderId}</td>
                                    <td><StarRating rating={review.rating} /></td>
                                    <td className={styles.contentCell}>
                                        {review.content.substring(0, 70)}
                                        {review.content.length > 70 && '...'}
                                    </td>
                                    <td>
                                        <Badge bg={review.isDeleted ? 'danger' : 'success'}>
                                            {review.isDeleted ? 'Deleted' : 'Visible'}
                                        </Badge>
                                    </td>
                                    <td className={styles.actionButtons}>
                                        <Button variant="link" size="sm" onClick={() => handleOpenDetails(review)} title="View Details">
                                            <Eye size={18} />
                                        </Button>
                                        {review.isDeleted ? (
                                            <Button variant="link" size="sm" onClick={() => handleToggleStatus(review, false)} title="Restore Review">
                                                <RotateCcw size={18} className="text-success" />
                                            </Button>
                                        ) : (
                                            <Button variant="link" size="sm" onClick={() => handleToggleStatus(review, true)} title="Delete Review">
                                                <Trash2 size={18} className="text-danger" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="text-center">리뷰가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
            {renderPagination()}

            {/* --- Modal --- */}
            {selectedReview && (
                <ReviewDetailsModal
                    show={showDetailsModal}
                    handleClose={handleCloseDetails}
                    review={selectedReview}
                />
            )}
        </div>
    );
}

export default ReviewManagement;