import axios from "axios";


export const HTTP_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`

export const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV == "development" ? HTTP_URL : "/api",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json', 
    }
})