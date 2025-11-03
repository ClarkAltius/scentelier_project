import React, { useState, useEffect } from 'react';
import styles from './InquiryManagement.module.css';
import { Search, Filter, Eye, MessageSquare, CheckCircle, Archive, ArrowUp, ArrowDown } from 'lucide-react';
import { API_BASE_URL } from '../config/config';
import axios from 'axios';
import { updateInquiryStatus } from '../api/InquiryApi';
import { Pagination } from 'react-bootstrap';

/**
 * InquiryManagement Component
 *
 */
function InquiryManagement({ setActiveView, setSelectedInquiryId }) {
    // === STATE VARIABLES ===

    // Holds the list of inquiries displayed. Initially populated with mock data.
    // In the future, this will be populated by an API call.
    const [inquiries, setInquiries] = useState([]);

    // Stores the currently selected inquiry for viewing details or replying. `null` if none selected.
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    // Stores the search term entered by the admin.
    const [searchTerm, setSearchTerm] = useState('');

    // Stores the selected filter criteria for status (e.g., 'All', 'PENDING', 'ANSWERED').
    const [filterStatus, setFilterStatus] = useState('All');

    // Stores the selected filter criteria for type (e.g., 'All', 'PRODUCT', 'DELIVERY').
    const [filterType, setFilterType] = useState('All');

    // Loading state for asynchronous operations (like fetching data).
    const [isLoading, setIsLoading] = useState(false);

    // Error state to display messages if API calls fail.
    const [error, setError] = useState(null);

    // 검색, 정렬, 페이징 용 스테이트
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [sortColumn, setSortColumn] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

    // 검색창 딜레이 훅
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // === LIFECYCLE HOOKS ===

    /**
     * useEffect Hook: Fetches inquiries when the component mounts.
     */
    useEffect(() => {
        const fetchInquiries = async () => {
            setIsLoading(true); // 로딩 활성화
            setError(null); // 에러 초기화

            const params = new URLSearchParams({
                page: currentPage,
                size: pageSize,
                sort: `${sortColumn},${sortDirection}`
            });

            if (debouncedSearchTerm) {
                params.append('search', debouncedSearchTerm);
            }
            if (filterStatus !== 'All') {
                params.append('status', filterStatus);
            }
            if (filterType !== 'All') {
                params.append('type', filterType);
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/api/admin/inquiries?${params.toString()}`, {
                    withCredentials: true
                });

                setInquiries(response.data.content);
                console.log(response.data.content);
                setTotalPages(response.data.totalPages);

            } catch (err) {
                console.error("Failed to fetch inquiries:", err);
                setError("문의 목록을 불러오는 데 실패했습니다.");
                setInquiries([]); // Clear list on error
                setTotalPages(0); // Reset pages on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchInquiries();
    }, [currentPage, pageSize, debouncedSearchTerm, filterStatus, filterType, sortColumn, sortDirection]);

    // === EVENT HANDLERS ===

    /**
     * handleSearchChange: Updates the search term state.
     */
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(0);
    };

    const handleSort = (columnName) => {
        // If clicking the same column, reverse the direction
        if (sortColumn === columnName) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // If clicking a new column, set it and default to ascending
            setSortColumn(columnName);
            setSortDirection('asc');
        }
        // Reset to page 0 when sort changes
        setCurrentPage(0);
    };

    /**
     * renderSortIcon: Helper to display an up/down arrow for the sorted column.
     */
    const renderSortIcon = (columnName) => {
        if (sortColumn !== columnName) {
            return null; // Not the active column, show no icon
        }
        return sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
    };

    /**
     * handleFilterChange (Generic): Updates filter state based on filter type.
     * @param {string} filterType - 'status' or 'type'.
     * @param {React.ChangeEvent<HTMLSelectElement>} event - The select change event.
     */
    const handleFilterChange = (filterType, event) => {
        if (filterType === 'status') {
            setFilterStatus(event.target.value);
        } else if (filterType === 'type') {
            setFilterType(event.target.value);
        }
        setCurrentPage(0);
    };

    const handleViewDetails = (inquiry) => {

        if (!setSelectedInquiryId) {
            console.error("setSelectedInquiryId function was not passed to InquiryManagement");
            return;
        }
        setSelectedInquiryId(inquiry.id);
        setActiveView('inquiryDetail');
    };


    const handleMarkAsClosed = async (inquiryId) => {
        if (window.confirm(`정말로 문의 #${inquiryId}을(를) 종결 처리하시겠습니까?`)) {
            try {
                // 1. InquiryAPI 에서 기능 호출
                const updatedInquiry = await updateInquiryStatus(inquiryId, "CLOSED");

                // 2. inquries list 스테이트 수정
                setInquiries(prevInquiries =>
                    prevInquiries.map(inq =>
                        inq.id === inquiryId ? updatedInquiry : inq
                    )
                );
                alert(`문의 #${inquiryId}이(가) 종결 처리되었습니다.`);
            } catch (err) {
                console.error(`Failed to close inquiry ${inquiryId}:`, err);
                alert(`문의 #${inquiryId} 종결 처리 중 오류가 발생했습니다: ${err.message}`);
            }
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber - 1); // Convert 1-based UI index to 0-based state index
    };

    // === RENDER LOGIC ===

    if (isLoading) {
        return <div className={styles.loading}>Loading inquiries...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    return (
        <div className={styles.inquiryManagementPage}>
            {/* Header 는 Topbar에 */}
            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by ID, Name, Email, Title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                {/* Status Filter */}
                <div className={styles.filterDropdown}>
                    <Filter size={16} />
                    <select value={filterStatus} onChange={(e) => handleFilterChange('status', e)}>
                        <option value="All">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="ANSWERED">Answered</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
                {/* Type Filter */}
                <div className={styles.filterDropdown}>
                    <Filter size={16} />
                    <select value={filterType} onChange={(e) => handleFilterChange('type', e)}>
                        <option value="All">All Types</option>
                        <option value="PRODUCT">Product</option>
                        <option value="DELIVERY">Delivery</option>
                        <option value="PAYMENT">Payment</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>

            {/* Inquiry Table */}
            <div className={styles.tableContainer}>
                <table className={styles.inquiryTable}>
                    <thead>
                        <tr>
                            <th className={styles.sortableHeader} onClick={() => handleSort('id')}>
                                ID {renderSortIcon('id')}
                            </th>
                            <th className={styles.sortableHeader} onClick={() => handleSort('user.username')}>
                                고객 {renderSortIcon('user.username')}
                            </th>
                            <th className={styles.sortableHeader} onClick={() => handleSort('title')}>
                                제목 {renderSortIcon('title')}
                            </th>
                            <th className={styles.sortableHeader} onClick={() => handleSort('type')}>
                                종류 {renderSortIcon('type')}
                            </th>
                            <th className={styles.sortableHeader} onClick={() => handleSort('createdAt')}>
                                날짜 {renderSortIcon('createdAt')}
                            </th>
                            <th className={styles.sortableHeader} onClick={() => handleSort('status')}>
                                상태 {renderSortIcon('status')}
                            </th>
                            <th>행동</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.length > 0 ? (
                            inquiries.map((inquiry) => (
                                <tr key={inquiry.id}>
                                    <td>#{inquiry.id}</td>
                                    <td>
                                        <div>{inquiry.username}</div>
                                        <div className={styles.customerEmail}>{inquiry.userEmail}</div>
                                    </td>
                                    <td className={styles.titleCell}>{inquiry.title}</td>
                                    <td>{inquiry.type}</td>
                                    <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[`status${inquiry.status}`]}`}>
                                            {inquiry.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            {/* Button to view*/}
                                            <button
                                                className={`${styles.actionButton} ${styles.viewButton}`}
                                                onClick={() => handleViewDetails(inquiry)}
                                                title="View Details / Reply"
                                            >
                                                <Eye size={16} /> 상세보기
                                            </button>

                                            {/* Button to mark as closed (if not already closed) */}
                                            {inquiry.status !== 'CLOSED' && (
                                                <button
                                                    className={`${styles.actionButton} ${styles.closeButton}`}
                                                    onClick={() => handleMarkAsClosed(inquiry.id)}
                                                    title="Mark as Closed"
                                                >
                                                    <CheckCircle size={16} /> 완료처리
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={styles.noResults}>카테고리에 해당하는 문의사항이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 0 && (
                <div className={styles.paginationContainer}>
                    <Pagination>
                        <Pagination.First
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 0}
                        />
                        <Pagination.Prev
                            onClick={() => handlePageChange(currentPage)} // currentPage is 0-indexed, (currentPage+1) - 1 = currentPage
                            disabled={currentPage === 0}
                        />

                        {/* This is a simple page number display.
                          For many pages, you'd want to add logic for "..." ellipsis.
                        */}
                        {[...Array(totalPages).keys()].map(pageIdx => (
                            <Pagination.Item
                                key={pageIdx + 1}
                                active={pageIdx === currentPage}
                                onClick={() => handlePageChange(pageIdx + 1)}
                            >
                                {pageIdx + 1}
                            </Pagination.Item>
                        ))}

                        <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 2)} // (currentPage+1) + 1 = currentPage + 2
                            disabled={currentPage >= totalPages - 1}
                        />
                        <Pagination.Last
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage >= totalPages - 1}
                        />
                    </Pagination>
                </div>
            )}

            {/* TODO: Implement Modal for viewing details and replying */}
            {/* {selectedInquiry && (
                <InquiryDetailsModal
                    inquiry={selectedInquiry}
                    onClose={() => setSelectedInquiry(null)}
                    onReply={handleReply} // Pass reply handler
                    onCloseInquiry={handleMarkAsClosed} // Optionally pass close handler
                />
             )} */}
        </div>
    );
}

export default InquiryManagement;