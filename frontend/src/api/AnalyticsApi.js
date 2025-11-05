import axios from 'axios';
import { API_BASE_URL } from '../config/config';

// Create an axios instance for analytics, matching the pattern in DashboardApi.js
const analyticsApi = axios.create({
    baseURL: `${API_BASE_URL}/api/analytics`,
    withCredentials: true,
});

const createQueryString = (params) => {
    const query = new URLSearchParams();
    for (const key in params) {
        const value = params[key];
        if (value !== null && value !== undefined) {
            if (value instanceof Date) {
                // Ensure dates are sent in 'yyyy-MM-dd' format
                query.append(key, value.toISOString().split('T')[0]);
            } else if (Array.isArray(value)) {
                // Handle array parameters (like categories)
                value.forEach(item => query.append(key, item));
            } else {
                query.append(key, value);
            }
        }
    }
    return query.toString();
};

// --- API Functions ---
// Now rewritten to use the axios instance and return response.data

export const getSalesOverTime = async (startDate, endDate, productType) => {
    const params = createQueryString({ startDate, endDate, productType });
    const response = await analyticsApi.get(`/sales-over-time?${params}`);
    return response.data;
};

export const getAovOverTime = async (startDate, endDate) => {
    const params = createQueryString({ startDate, endDate });
    const response = await analyticsApi.get(`/aov-over-time?${params}`);
    return response.data;
};

export const getCustomerBreakdown = async (startDate, endDate) => {
    const params = createQueryString({ startDate, endDate });
    const response = await analyticsApi.get(`/customer-breakdown?${params}`);
    return response.data;
};

export const getSalesByCategory = async (startDate, endDate, productType) => {
    const params = createQueryString({ startDate, endDate, productType });
    const response = await analyticsApi.get(`/sales-by-category?${params}`);
    return response.data;
};

export const getPopularIngredients = async (startDate, endDate) => {
    const params = createQueryString({ startDate, endDate });
    const response = await analyticsApi.get(`/popular-ingredients?${params}`);
    return response.data;
};

export const getProductPerformance = async (startDate, endDate, productType, categories) => {
    const params = createQueryString({ startDate, endDate, productType, categories });
    const response = await analyticsApi.get(`/product-performance?${params}`);
    return response.data;
};

export const getTopCustomers = async (startDate, endDate) => {
    const params = createQueryString({ startDate, endDate });
    const response = await analyticsApi.get(`/top-customers?${params}`);
    return response.data;
};