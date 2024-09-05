import axios from 'axios';

const API_URL = 'https://manual-final.onrender.com';

export const fetchData = async (endpoint) => {
    try {
        const response = await axios.get(`${API_URL}/${endpoint}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const askQuestion = async (question) => {
    try {
        const response = await axios.post(`${API_URL}/ask`, { question });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
