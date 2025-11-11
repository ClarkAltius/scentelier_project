// We are keeping all your imports, they are correct.
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './InquiryDetail.module.css';
import { API_BASE_URL } from '../config/config';
import { useAuth } from "../component/AuthContext.js"; //useAuth 훅 가져오기
import { ArrowLeft, Send, Lock } from 'lucide-react';
import {
    fetchInquiryDetails,
    // submitInquiryAnswer, // <-- We no longer need this here
    updateInquiryStatus
} from '../api/InquiryApi';


// --- 1. IMPORT OUR NEW CHAT COMPONENT ---
// (Your file already had this, now we'll use it!)
import InquiryChat from './InquiryChat';

function InquiryDetail({ setActiveView, inquiryId }) {
    const { user: adminUser } = useAuth();

    const [inquiryDetails, setInquiryDetails] = useState(null);
    // const [answers, setAnswers] = useState([]); // <-- 2. DELETE (Handled by InquiryChat)
    // const [newAnswer, setNewAnswer] = useState(''); // <-- 3. DELETE (Handled by InquiryChat)
    const [isLoading, setIsLoading] = useState(false);
    // This is still used by handleCloseInquiry, so we keep it
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!inquiryId) {
            setError("문의 ID가 제공되지 않았습니다.");
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // This function is still good, it gets all the info
                const data = await fetchInquiryDetails(inquiryId);
                setInquiryDetails(data);

                // --- 4. DELETE ALL THIS ---
                // We no longer need to manage 'answers' state here.
                // The InquiryChat component will fetch its own messages.
                /*
                const formattedAnswers = data.answers.map(answer => ({
                    // ... (mapping logic)
                }));
                setAnswers(formattedAnswers || []);
                */

            } catch (err) {
                console.error("Failed to load inquiry details:", err);
                setError("문의 내용을 불러오는 데 실패했습니다: " + err.message);
                setInquiryDetails(null);
                // setAnswers([]); // <-- No longer needed
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [inquiryId]);

    // --- 5. DELETE THE ENTIRE handleSubmitAnswer FUNCTION ---
    // This is now fully handled inside InquiryChat.js
    /*
    const handleSubmitAnswer = async (e) => {
        // ... (all this logic is gone)
    };
    */

    // --- We KEEP handleCloseInquiry, it's good logic ---
    const handleCloseInquiry = async () => {
        if (!inquiryId) return;

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

    // --- All this loading/error/not found logic is perfect, KEEP it ---
    if (isLoading) {
        return <div className={styles.loading}>문의 내용을 불러오는 중...</div>;
    }
    if (error && !inquiryDetails) {
        return <div className={styles.error}>오류: {error}</div>;
    }
    if (!inquiryDetails) {
        return (
            <div className={styles.container}>
                {/* ... (your not found JSX) ... */}
            </div>
        );
    }

    // --- 6. SIMPLIFY THE JSX (THE BEST PART) ---
    return (
        <div className={styles.container}>

            {/* --- 1. THE HEADER (NO CHANGES) --- */}
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

                {/* --- 2. THE INFO BOX (NO CHANGES - As Requested) --- */}
                <div className={styles.infoBox}>
                    <h3>문의 정보</h3>
                    <div className={styles.metaInfo}>
                        <strong>상태:</strong>
                        <span className={`${styles.statusBadge} ${styles[`status${inquiryDetails.status}`]}`}>
                            {inquiryDetails.status}
                        </span>
                        <strong>작성자:</strong>
                        <span>{inquiryDetails.username} ({inquiryDetails.userEmail})</span>
                        {/* ... (all your other info fields) ... */}
                        <strong>유형:</strong>
                        <span>{inquiryDetails.type}</span>
                    </div>
                </div>

                {/* --- 3. THE CHAT THREAD (Refactored) --- */}
                <div className={styles.thread}>

                    {/* The Original Inquiry (As Requested) */}
                    <div className={`${styles.message} ${styles.customerMessage}`}>
                        <div className={styles.messageHeader}>
                            <strong>{inquiryDetails.username}</strong>
                            <span className={styles.messageDate}>{new Date(inquiryDetails.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{inquiryDetails.content}</p>
                    </div>

                    {/* * --- 7. REPLACE ALL THE OLD LOGIC... ---
                      * We are DELETING the answers.map(), the "No answers" p tag,
                      * and the entire <form> block.
                      */
                    }

                    {/* --- ...WITH OUR NEW COMPONENT --- */}
                    {/* * This single component now handles:
                      * 1. Fetching all follow-ups (InquiryFollowUp.java)
                      * 2. Displaying all chat bubbles (user and admin)
                      * 3. The "Send" input box
                      * 4. Posting new messages (user and admin)
                      */
                    }
                    {inquiryDetails.status !== 'CLOSED' ? (
                        <InquiryChat inquiryId={inquiryDetails.id} />
                    ) : (
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