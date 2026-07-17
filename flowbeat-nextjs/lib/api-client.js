import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type' : 'application/json',
        'Accept':  'application/json',
    }
})

let interceptorId = null;

export const setupAuthInterceptor = (getToken) => {
    // Hapus interceptor lama sebelum mendaftarkan yang baru
    if (interceptorId !== null) {
        apiClient.interceptors.request.eject(interceptorId);
    }

    interceptorId = apiClient.interceptors.request.use(
        async (config) => {
            const token = await getToken()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        }, 
        (error) => {
            return Promise.reject(error)
        }
    );
} 

export default apiClient