import axios from 'axios';
import { API_BASE_URL } from '../config/config';

/**
 * Fetches the details for a single inquiry.
 */
export const fetchInquiryDetails = async (inquiryId) => {
    const url = `${API_BASE_URL}/api/admin/inquiries/${inquiryId}`;
    try {
        const res = await axios.get(url, { withCredentials: true });
        return res.data;
    } catch (err) {
        console.error("Error fetching inquiry details:", err);
        throw err;
    }
};

/**
 * Submits a new answer for an inquiry.
 */
export const submitInquiryAnswer = async (inquiryId, answerContent) => {
    const url = `${API_BASE_URL}/api/admin/inquiries/${inquiryId}/answers`;
    const requestData = { content: answerContent };

    try {
        const res = await axios.post(url, requestData, { withCredentials: true });
        return res.data;
    } catch (err) {
        console.error("Error submitting answer:", err);
        throw err;
    }
};

/**
 * Updates the status of an inquiry (e.g., to "CLOSED").
 */
export const updateInquiryStatus = async (inquiryId, status) => {
    const url = `${API_BASE_URL}/api/admin/inquiries/${inquiryId}/status`;
    const requestData = { status: status };

    try {
        const res = await axios.patch(url, requestData, { withCredentials: true });
        return res.data; // Returns the updated inquiry DTO
    } catch (err) {
        console.error("Error updating inquiry status:", err);
        throw err;
    }
};