// services/api/login.js
export const login = async (phone_number, password) => {
    try {
        // console.log('Mengirim request login:', { phone_number, password });
        const res = await fetch('http://192.168.1.9:3000/api/login', {
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
        console.error('Error login:', err);
        throw err;
    }
};
