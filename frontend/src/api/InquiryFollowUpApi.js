import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

/**
 * Fetches the entire chat history for a single inquiry.
 */
export const getFollowUps = (inquiryId) => {
    return api.get(`/api/inquiry/${inquiryId}/followups`);
};

/**
 * Posts a new chat message (follow-up).
 */
export const postFollowUp = (inquiryId, message) => {
    return api.post(`/api/inquiry/${inquiryId}/followup`, { message });
};