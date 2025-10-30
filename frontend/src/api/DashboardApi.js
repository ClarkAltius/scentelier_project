import axios from 'axios';
import { API_BASE_URL } from '../config/config';


// axios 인스턴스. 아래 API 호출에서 재활용
const dashboardApi = axios.create({
    baseURL: `${API_BASE_URL}/api/dashboard`,
    withCredentials: true,
});

export const getKpis = async () => {
    const response = await dashboardApi.get('/kpis');
    return response.data;
};

export const getSalesBreakdown = async () => {
    const response = await dashboardApi.get('/sales-breakdown');
    return response.data;
};

export const getOperationalData = async () => {
    const response = await dashboardApi.get('/operational-data');
    return response.data;
};

export const getBestSellers = async () => {
    const response = await dashboardApi.get('/best-sellers');
    return response.data;
};

export const getMostUsedIngredients = async () => {
    const response = await dashboardApi.get('/most-used-ingredients');
    return response.data;
};

export const getLowStockItems = async () => {
    const response = await dashboardApi.get('/low-stock-items');
    return response.data;
};

export const getMonthlySales = async () => {
    const response = await dashboardApi.get('/monthly-sales');
    return response.data;
};