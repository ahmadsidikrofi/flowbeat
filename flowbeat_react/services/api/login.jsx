import axios from "axios";

const BASE_URL = "https://namadomainmu.com/api"; // URL Laravel API kamu

export const login = async (phone, password) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
        phone,
        password,
        });
        return response.data;
    } catch (error) {
        console.log(error.response?.data || error.message);
        throw error;
    }
};
