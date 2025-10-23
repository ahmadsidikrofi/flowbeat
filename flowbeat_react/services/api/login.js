// services/api/login.js

import { EXPO_PUBLIC_API_URL } from '@env';
const API_URL = EXPO_PUBLIC_API_URL;


export const login = async (phone_number, password) => {
    try {
        // console.log('Mengirim request login:', { phone_number, password });
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: phone_number, password })
        });

        if (!res.ok) {
        throw new Error('Login gagal');
        }

        const data = await res.json();
        // console.log('Response dari server:', data); // ✅ Log response
        
        if (!res.ok) {
            throw new Error(data.message || 'Login gagal');
        }

        return data;
    } catch (err) {
        // console.error('Error login:', err);
        throw err;
    }
};
