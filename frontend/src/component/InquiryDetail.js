import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './InquiryDetail.module.css'; // The new CSS module
import { API_BASE_URL } from '../config/config';
import { useAuth } from './AuthContext'; // To get the current admin user info
import { ArrowLeft, Send, Lock } from 'lucide-react';
import {
    fetchInquiryDetails,
    submitInquiryAnswer,
    updateInquiryStatus
} from '../api/InquiryApi';

function InquiryDetail({ setActiveView, inquiryId }) {
    const { user: adminUser } = useAuth(); // 현 관리자 정보 호출

    const [inquiryDetails, setInquiryDetails] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // inquiryId 변경시 다시 훅 사용
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

    // 신규 답변 제출 핸들러
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
            // 'newAnswer' is just the string, 'result' is the new answer object from the API
            const result = await submitInquiryAnswer(inquiryId, newAnswer);

            // --- ✅ BUG FIX APPLIED ---
            // We must use the 'result' object returned from the API,
            // not the 'newAnswer' string.
            const formattedAnswer = {
                id: result.id,
                content: result.content,
                createdAt: result.createdAt,
                // Adjust 'result.adminUsername' to match your API response
                user: { username: result.adminUsername || adminUser.username }
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


    // 문의사항 완료처리 핸들러
    const handleCloseInquiry = async () => {
        if (!inquiryId) return;

        // Note: window.confirm is used here as per original code.
        // Consider replacing with a custom modal for better UX later.
        if (!window.confirm("이 문의를 'CLOSED' 상태로 변경하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const updatedInquiry = await updateInquiryStatus(inquiryId, "CLOSED");
            setInquiryDetails(updatedInquiry);
            alert("문의가 성공적으로 마감되었습니다.");

        } catch (err) {
            console.error("Failed to close inquiry:", err);
            setError("문의 마감 중 오류가 발생했습니다: " + err.message);
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

    // --- 🎨 NEW INTUITIVE JSX LAYOUT ---
    return (
        <div className={styles.container}>

            {/* --- 1. THE HEADER --- */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => setActiveView('inquiries')}>
                    <ArrowLeft size={18} /> 목록으로 돌아가기
                </button>

                <h2 className={styles.headerTitle}>
                    {inquiryDetails.title}
                </h2>

                {inquiryDetails.status !== 'CLOSED' && (
                    <button
                        className={styles.closeButton}
                        onClick={handleCloseInquiry}
                        disabled={isSubmitting}
                    >
                        <Lock size={16} /> 문의 마감
                    </button>
                )}
            </div>

            {/* --- MAIN CONTENT (Grid Layout) --- */}
            <div className={styles.mainContent}>

                {/* --- 2. THE INFO BOX --- */}
                <div className={styles.infoBox}>
                    <h3>문의 정보</h3>
                    <div className={styles.metaInfo}>
                        <strong>상태:</strong>
                        <span className={`${styles.statusBadge} ${styles[`status${inquiryDetails.status}`]}`}>
                            {inquiryDetails.status}
                        </span>

                        <strong>작성자:</strong>
                        <span>{inquiryDetails.username} ({inquiryDetails.userEmail})</span>

                        <strong>작성일:</strong>
                        <span>{new Date(inquiryDetails.createdAt).toLocaleString()}</span>

                        <strong>유형:</strong>
                        <span>{inquiryDetails.type}</span>

                        {inquiryDetails.product && (
                            <>
                                <strong>관련 상품:</strong>
                                <span>{inquiryDetails.product.name} (ID: {inquiryDetails.product.id})</span>
                            </>
                        )}
                    </div>
                </div>

                {/* --- 3. THE CHAT THREAD --- */}
                <div className={styles.thread}>

                    {/* The Original Inquiry (styled as the first message) */}
                    <div className={`${styles.message} ${styles.customerMessage}`}>
                        <div className={styles.messageHeader}>
                            <strong>{inquiryDetails.username}</strong>
                            <span className={styles.messageDate}>{new Date(inquiryDetails.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{inquiryDetails.content}</p>
                    </div>

                    {/* The Answers List */}
                    {answers.map((answer) => (
                        <div key={answer.id} className={`${styles.message} ${styles.adminMessage}`}>
                            <div className={styles.messageHeader}>
                                <strong>{answer.user?.username || '관리자'} (Admin)</strong>
                                <span className={styles.messageDate}>{new Date(answer.createdAt).toLocaleString()}</span>
                            </div>
                            <p>{answer.content}</p>
                        </div>
                    ))}

                    {/* Show "No answers" only if there are none */}
                    {answers.length === 0 && (
                        <p className={styles.noAnswer}>아직 등록된 답변이 없습니다.</p>
                    )}

                    {/* The Answer Form (at the end of the thread) */}
                    {inquiryDetails.status !== 'CLOSED' && (
                        <form onSubmit={handleSubmitAnswer} className={styles.newAnswerForm}>
                            {error && <div className={styles.errorBanner}>오류: {error}</div>}
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
                    )}

                    {/* Show a message if the inquiry is closed */}
                    {inquiryDetails.status === 'CLOSED' && (
                        <div className={styles.closedMessage}>
                            <Lock size={16} /> 이 문의는 마감되었습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InquiryDetail;
