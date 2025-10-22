// services/api/register.js
export const register = async (name, phone_number, password, address) => {
    try {
        const res = await fetch('http://192.168.1.9:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone_number, password, address }),
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
