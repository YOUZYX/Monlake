import axios from 'axios';

const BASE_URL = 'https://api.envio.network/v1'; // Replace with the actual Envio API base URL

export const fetchTokenTransfers = async (limit = 10) => {
    try {
        const response = await axios.get(`${BASE_URL}/token-transfers`, {
            params: { limit },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching token transfers:', error);
        throw error;
    }
};

export const fetchBlockStats = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/block-stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching block statistics:', error);
        throw error;
    }
};

// Add more API functions as needed for your dashboard features.