import axios from "axios";
import { useAuth } from "@clerk/nextjs"

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type' : 'application/json',
        'Accept':  'application/json',
    }
})

export const setupAuthInterceptor = (getToken) => {
    apiClient.interceptors.request.use(
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