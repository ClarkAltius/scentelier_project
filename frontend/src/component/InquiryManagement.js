import React, { useState, useEffect } from 'react';
import styles from './InquiryManagement.module.css';
import { Search, Filter, Eye, MessageSquare, CheckCircle, Archive } from 'lucide-react';
import { API_BASE_URL } from '../config/config';
import axios from 'axios';

/**
 * InquiryManagement Component
 *
 */
function InquiryManagement() {
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

    // === LIFECYCLE HOOKS ===

    /**
     * useEffect Hook: Fetches inquiries when the component mounts.
     *
     * Currently, it sets mock data.
     * TODO: Replace with API call to fetch inquiries (e.g., GET /api/admin/inquiries).
     * Add parameters for pagination, sorting, filtering if needed.
     */
    useEffect(() => {
        setIsLoading(true); // 로딩 활성화
        setError(null); // 에러 초기화
        setTimeout(async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/admin/inquiries`, { withCredentials: true }); //admin API 엔드포인트
                setInquiries(response.data);
                // console.log(response.data); //디버깅
            } catch (err) {
                console.error("Failed to fetch inquiries:", err);
                setError("문의 목록을 불러오는 데 실패했습니다.");
                setInquiries([]); //초기화
            } finally {
                setIsLoading(false);
            }
        }, 500)
    }, []);

    // === EVENT HANDLERS ===

    /**
     * handleSearchChange: Updates the search term state.
     */
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
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
    };

    /**
     * handleViewDetails: Sets the selected inquiry to display details/reply form.
     * @param {object} inquiry - The inquiry object to view/reply to.
     *
     * TODO: Implement a modal or dedicated view component (`InquiryDetailsModal`)
     * to show the full inquiry content and provide a reply textarea.
     */

    const handleViewDetails = (inquiry) => {
        setSelectedInquiry(inquiry);
        console.log("Viewing/Replying to inquiry:", inquiry.id);
        // Example: setShowDetailsModal(true);
        alert(`문의 상세 보기/답변하기:\nID: ${inquiry.id}\n제목: ${inquiry.title}\n상태: ${inquiry.status}\n\n(실제 앱에서는 모달 창 등으로 표시됩니다.)`);
    };

    /**
     * handleReply: Placeholder for submitting a reply to an inquiry.
     * @param {number} inquiryId - The ID of the inquiry being replied to.
     * @param {string} replyContent - The content of the admin's reply.
     *
     * TODO: Implement API call (e.g., POST /api/admin/inquiries/{inquiryId}/reply)
     * to submit the reply and update the inquiry status (likely to 'ANSWERED').
     * Update local state on success. Handle errors. Close the details/reply modal.
     */
    const handleReply = (inquiryId, replyContent) => {
        if (!replyContent || replyContent.trim() === '') {
            alert("답변 내용을 입력해주세요.");
            return;
        }
        console.log(`TODO: Submit reply for inquiry ${inquiryId}. Content:`, replyContent);
        // Example state update:
        // setInquiries(prevInquiries =>
        //     prevInquiries.map(inq =>
        //         inq.id === inquiryId ? {
        //             ...inq,
        //             status: 'ANSWERED',
        //             answer: { adminName: 'Admin', answeredAt: new Date().toISOString(), content: replyContent }
        //         } : inq
        //     )
        // );
        // setSelectedInquiry(null); // Close modal on success
        alert(`[Placeholder] 문의 #${inquiryId}에 답변을 등록합니다.`);
        setSelectedInquiry(null); // Close placeholder
    };

    /**
     * handleMarkAsClosed: Placeholder for marking an inquiry as closed.
     * @param {number} inquiryId - The ID of the inquiry to close.
     *
     * TODO: Implement API call (e.g., PUT /api/admin/inquiries/{inquiryId}/status)
     * to update the status to 'CLOSED'. Update local state. Add confirmation.
     */
    const handleMarkAsClosed = (inquiryId) => {
        if (window.confirm(`정말로 문의 #${inquiryId}을(를) 종결 처리하시겠습니까?`)) {
            console.log(`TODO: Mark inquiry ${inquiryId} as CLOSED`);
            // Example state update:
            // setInquiries(prevInquiries =>
            //     prevInquiries.map(inq =>
            //         inq.id === inquiryId ? { ...inq, status: 'CLOSED' } : inq
            //     )
            // );
            alert(`[Placeholder] 문의 #${inquiryId}을(를) 종결 처리합니다.`);
        }
    };

    // === DERIVED STATE & FILTERING/SEARCHING LOGIC ===

    /**
     * Filtered and Searched Inquiries: Computes the list based on filters and search.
     *
     * TODO: Refine search logic (e.g., search content).
     */
    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesStatus = filterStatus === 'All' || inquiry.status === filterStatus;
        const matchesType = filterType === 'All' || inquiry.type === filterType;
        const matchesSearch = searchTerm === '' ||
            inquiry.id.toString().includes(searchTerm) ||
            inquiry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    });

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
                            <th>ID</th>
                            <th>고객</th>
                            <th>제목</th>
                            <th>종류</th>
                            <th>날짜</th>
                            <th>상태</th>
                            <th>행동</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInquiries.length > 0 ? (
                            filteredInquiries.map((inquiry) => (
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
                                            {/* Button to view/reply */}
                                            <button
                                                className={`${styles.actionButton} ${styles.viewButton}`}
                                                onClick={() => handleViewDetails(inquiry)}
                                                title="View Details / Reply"
                                            >
                                                <Eye size={16} /> View / Reply
                                            </button>

                                            {/* Button to mark as closed (if not already closed) */}
                                            {inquiry.status !== 'CLOSED' && (
                                                <button
                                                    className={`${styles.actionButton} ${styles.closeButton}`}
                                                    onClick={() => handleMarkAsClosed(inquiry.id)}
                                                    title="Mark as Closed"
                                                >
                                                    <CheckCircle size={16} /> Close
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={styles.noResults}>No inquiries found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* TODO: Add Pagination controls */}

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