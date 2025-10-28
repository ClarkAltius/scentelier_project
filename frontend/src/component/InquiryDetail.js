import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './InquiryDetail.module.css'; // We'll create this CSS module
import { API_BASE_URL } from '../config/config';
import { useAuth } from './AuthContext'; // To get the current admin user info
import { ArrowLeft, Send } from 'lucide-react';

// --- Placeholder API Functions ---
// Replace these with actual API calls to AdminController later

/**
 * Placeholder to fetch inquiry details and associated answers.
 * In reality, this would fetch data based on the inquiryId.
 * It should ideally return the Inquiry object along with a list of InquiryAnswers.
 * @param {number} inquiryId - The ID of the inquiry to fetch.
 * @returns {Promise<object>} - Mock data representing the inquiry and its answers.
 */
const fetchInquiryDetails = async (inquiryId) => {
    console.log(`[Placeholder] Fetching details for inquiry ID: ${inquiryId}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // --- Mock Data Structure (Based on Inquiry and InquiryAnswers entities) ---
    const mockInquiry = {
        id: inquiryId,
        username: "박고객",
        userEmail: "customer@example.com",
        title: `문의 #${inquiryId}: 상품 재입고 관련 질문`,
        content: "안녕하세요, 'Midnight Blossom' 향수는 언제쯤 재입고될 예정인가요? 계속 품절 상태라 궁금합니다. 빠른 답변 부탁드립니다.",
        type: "PRODUCT", // From Inquiry entity (Type enum)
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Simulate 2 days ago
        status: "PENDING", // From Inquiry entity (Status enum)
        product: { id: 1, name: "Midnight Blossom" }, // Optional product info from Inquiry entity
    };

    const mockAnswers = [
        // Example structure if answers already exist
        // {
        //     id: 101,
        //     content: "고객님, 문의주신 'Midnight Blossom' 향수는 다음 주 중 입고될 예정입니다. 정확한 날짜는 확정되는 대로 다시 안내드리겠습니다.",
        //     createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Simulate 1 day ago
        //     user: { username: "김관리자" } // Admin user info from InquiryAnswers entity
        // },
    ];
    // --- End Mock Data ---

    // Simulate potential error
    // if (inquiryId === 999) throw new Error("Inquiry not found");

    return { inquiry: mockInquiry, answers: mockAnswers };
};

/**
 * Placeholder to submit a new answer for an inquiry.
 * In reality, this would POST the answer content to the backend.
 * The backend should create an InquiryAnswers record and potentially update the Inquiry status.
 * @param {number} inquiryId - The ID of the inquiry being answered.
 * @param {string} answerContent - The content of the admin's reply.
 * @param {object} adminUser - Information about the admin submitting the answer.
 * @returns {Promise<object>} - Mock data representing the newly created answer.
 */
const submitInquiryAnswer = async (inquiryId, answerContent, adminUser) => {
    console.log(`[Placeholder] Submitting answer for inquiry ID: ${inquiryId}`);
    console.log(`[Placeholder] Answer Content: ${answerContent}`);
    console.log(`[Placeholder] Admin User:`, adminUser);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // --- Mock Response Structure (Based on InquiryAnswers entity) ---
    const newAnswer = {
        id: Math.floor(Math.random() * 1000) + 100, // Simulate new ID
        content: answerContent,
        createdAt: new Date().toISOString(),
        user: { username: adminUser?.username || 'Admin' } // Use logged-in admin username
    };
    // --- End Mock Response ---

    // Simulate potential error
    // if (answerContent.toLowerCase().includes('error')) throw new Error("Failed to submit answer");

    // In a real scenario, the backend might also return the updated Inquiry status
    return { newAnswer: newAnswer, updatedInquiryStatus: 'ANSWERED' };
};
// --- End Placeholder API Functions ---


/**
 * InquiryDetail Component
 * Displays details of a single inquiry and allows admins to respond.
 *
 * Props:
 * - setActiveView: Function to change the view in the parent Admin component.
 * - inquiryId: The ID of the inquiry to display.
 */
function InquiryDetail({ setActiveView, inquiryId }) {
    const { user: adminUser } = useAuth(); // Get current admin user info

    const [inquiryDetails, setInquiryDetails] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch inquiry details and answers when the component mounts or inquiryId changes
    useEffect(() => {
        if (!inquiryId) {
            setError("문의 ID가 제공되지 않았습니다.");
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Replace with actual API call
                const data = await fetchInquiryDetails(inquiryId);
                setInquiryDetails(data.inquiry);
                setAnswers(data.answers || []);
            } catch (err) {
                console.error("Failed to load inquiry details:", err);
                setError("문의 내용을 불러오는 데 실패했습니다: " + err.message);
                setInquiryDetails(null);
                setAnswers([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [inquiryId]); // Re-fetch if the inquiryId prop changes

    // Handle submission of the new answer
    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!newAnswer.trim()) {
            alert("답변 내용을 입력해주세요.");
            return;
        }
        if (!inquiryId || !adminUser) {
            alert("필수 정보(문의 ID 또는 관리자 정보)가 없습니다.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            // Replace with actual API call
            const result = await submitInquiryAnswer(inquiryId, newAnswer, adminUser);

            // Add the new answer to the list
            setAnswers(prevAnswers => [...prevAnswers, result.newAnswer]);

            // Update the inquiry status locally (backend should confirm this)
            if (inquiryDetails && result.updatedInquiryStatus) {
                setInquiryDetails(prev => ({ ...prev, status: result.updatedInquiryStatus }));
            }

            setNewAnswer(''); // Clear the textarea
            alert("답변이 성공적으로 등록되었습니다.");

            // Optionally navigate back to the list after submission
            // setActiveView('inquiries');

        } catch (err) {
            console.error("Failed to submit answer:", err);
            setError("답변 등록 중 오류가 발생했습니다: " + err.message);
            // Don't clear the textarea on error, allow user to retry
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render loading state
    if (isLoading) {
        return <div className={styles.loading}>문의 내용을 불러오는 중...</div>;
    }

    // Render error state
    if (error && !inquiryDetails) { // Show full page error only if initial load failed
        return <div className={styles.error}>오류: {error}</div>;
    }

    // Render inquiry not found (or initial state)
    if (!inquiryDetails) {
        return <div className={styles.container}>문의 내용을 찾을 수 없습니다. 목록으로 돌아가세요.</div>;
    }

    // Main render
    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => setActiveView('inquiries')}>
                <ArrowLeft size={18} /> 목록으로 돌아가기
            </button>

            {/* Inquiry Details Section */}
            <div className={styles.inquirySection}>
                <h2>문의 상세: {inquiryDetails.title}</h2>
                <div className={styles.metaInfo}>
                    <span><strong>작성자:</strong> {inquiryDetails.username} ({inquiryDetails.userEmail})</span>
                    <span><strong>작성일:</strong> {new Date(inquiryDetails.createdAt).toLocaleString()}</span>
                    <span><strong>유형:</strong> {inquiryDetails.type}</span>
                    <span>
                        <strong>상태:</strong>
                        <span className={`${styles.statusBadge} ${styles[`status${inquiryDetails.status}`]}`}>
                            {inquiryDetails.status}
                        </span>
                    </span>
                    {inquiryDetails.product && (
                        <span><strong>관련 상품:</strong> {inquiryDetails.product.name} (ID: {inquiryDetails.product.id})</span>
                    )}
                </div>
                <div className={styles.contentBox}>
                    <p>{inquiryDetails.content}</p>
                </div>
            </div>

            {/* Answers Section */}
            <div className={styles.answersSection}>
                <h3>답변 내역</h3>
                {answers.length === 0 ? (
                    <p>아직 등록된 답변이 없습니다.</p>
                ) : (
                    <ul className={styles.answerList}>
                        {answers.map((answer) => (
                            <li key={answer.id} className={styles.answerItem}>
                                <div className={styles.answerHeader}>
                                    <strong>{answer.user?.username || '관리자'}</strong>
                                    <span className={styles.answerDate}>{new Date(answer.createdAt).toLocaleString()}</span>
                                </div>
                                <p>{answer.content}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* New Answer Form Section */}
            {inquiryDetails.status !== 'CLOSED' && ( // Only show form if not closed
                <div className={styles.newAnswerSection}>
                    <h3>답변 작성</h3>
                    {/* Display submission errors here */}
                    {error && <div className={styles.errorBanner}>오류: {error}</div>}
                    <form onSubmit={handleSubmitAnswer}>
                        <textarea
                            className={styles.answerTextarea}
                            rows="6"
                            placeholder="답변 내용을 입력하세요..."
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            disabled={isSubmitting}
                            required
                        />
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting || !newAnswer.trim()}
                        >
                            <Send size={16} /> {isSubmitting ? '등록 중...' : '답변 등록'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default InquiryDetail;
