import axios from "axios";


export const HTTP_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`

export const axiosInstance = axios.create({
    baseURL: HTTP_URL, 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json', 
    }
})