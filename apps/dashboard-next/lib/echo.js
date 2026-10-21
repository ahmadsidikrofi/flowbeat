import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import apiClient from './api-client';
import axios from 'axios';

// Fungsi ini akan kita panggil dari komponen React
export const createEchoInstance = (auth) => {
    // Pastikan Pusher hanya di-set di browser
    if (typeof window !== 'undefined') {
        window.Pusher = Pusher;
    }

    const options = {
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`,
        auth: {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        },
        authorizer: (channel, options) => {
            return {
                authorize: async (socketId, callback) => {
                    // const authUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`;
                    try {
                        const token = await auth.getToken()
                        if (!token) {
                            console.error('No token available');
                            callback(true, null);
                            return;
                        }
                        const response = await axios.post(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`,
                            {
                                socket_id: socketId,
                                channel_name: channel.name
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                withCredentials: true
                            }
                        );
                        
                        callback(false, response.data);
                        
                    } catch (err) {
                        console.log("Got some err", err);
                    }
                }
            };
        },
    };
    return new Echo(options);
};