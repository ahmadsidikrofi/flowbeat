// services/api/register.js
import { EXPO_PUBLIC_API_URL } from '@env';
const API_URL = EXPO_PUBLIC_API_URL;

export const register = async (name, phone_number, password, address, photo = 'default-avatar-profile.jpg') => {
    try {
        const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone_number, password, address, photo }),
        });

        if (!res.ok) {
        throw new Error('Registrasi gagal');
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error register:', err);
        throw err;
    }
};
