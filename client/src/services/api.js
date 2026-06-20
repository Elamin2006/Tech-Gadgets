import axios from "axios";

const API = axios.create({
    baseURL: "https://tech-gadgets-server-kappa.vercel.app/api/v1", 
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;