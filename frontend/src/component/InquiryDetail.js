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
    const url = `${API_BASE_URL}/api/admin/inquiries/${inquiryId}`;
    try {
        const res = await axios.get(url, { withCredentials: true });
        return res.data;
    } catch (err) {
        console.error(err);
        console.log("API Call threw an error.");
        throw err;
    }

};

const submitInquiryAnswer = async (inquiryId, answerContent) => {
    const url = `${API_BASE_URL}/api/admin/inquiries/${inquiryId}/answers`;

    // content 만 들어있는 DTO.
    const requestData = {
        content: answerContent
    };
    console.log(`Submitting answer to: ${url}`);
    try {
        const res = await axios.post(
            url,
            requestData, //DTO 여기에
            { withCredentials: true }
        );

        return res.data;

    } catch (err) {
        console.error("Error submitting answer:", err);
        throw err;
    }
};

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
                const data = await fetchInquiryDetails(inquiryId);
                // 'data' IS the InquiryDto object itself
                setInquiryDetails(data);

                const formattedAnswers = data.answers.map(answer => ({
                    id: answer.id,
                    content: answer.content,
                    createdAt: answer.createdAt,
                    user: { username: answer.adminUsername }
                }));

                setAnswers(formattedAnswers || []);
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
        if (!inquiryId) {
            alert("문의 ID가 없습니다.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const result = await submitInquiryAnswer(inquiryId, newAnswer);

            // Add the new answer to the list
            const formattedAnswer = {
                id: newAnswer.id,
                content: newAnswer.content,
                createdAt: newAnswer.createdAt,
                user: { username: newAnswer.adminUsername } // 백엔드에서 돌아온 username 사용
            };

            /// 3. 리스트에 답변 매핑
            setAnswers(prevAnswers => [...prevAnswers, formattedAnswer]);

            // 4. 로컬에서 문의사항 내역 업데이트 (PENDING->ANSWERED)
            if (inquiryDetails) {
                setInquiryDetails(prev => ({ ...prev, status: 'ANSWERED' }));
            }

            setNewAnswer(''); // 텍스트 인풋 영역 초기화
            alert("답변이 성공적으로 등록되었습니다.");

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
        return <div className={styles.container}>
            문의 내용을 찾을 수 없습니다. 목록으로 돌아가세요.
            <button className={styles.backButton} onClick={() => setActiveView('inquiries')}>
                <ArrowLeft size={18} /> 목록으로 돌아가기
            </button>
        </div>;

    }

    // Main render
    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => setActiveView('inquiries')}>
                <ArrowLeft size={18} /> 목록으로 돌아가기
            </button>

            {/* Inquiry Details Section */}
            <div className={styles.inquirySection}>
                <h2>문의 제목: {inquiryDetails.title}</h2>
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
