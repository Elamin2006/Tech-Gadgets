import API from "./api";

export const AuthService = {

     register: async (userData) => {
        try {

            const response = await API.post("/users/register", userData);
            return response.data;

        } catch (error) {
            throw error.response?.data || { message: "Registration failed" };
        }
    },
    
    login: async (email, password) => {
        try {
            const response = await API.post("/users/login", { email, password });
            
            if (response.data.success && response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.data)); 
            }
            
            return response.data; 
        } catch (error) {
            throw error.response?.data || { message: "Something went wrong" };
        }
    },


    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login"; 
    },

    isAuthenticated: () => {
        return !!localStorage.getItem("token");
    },

    getCurrentUser: () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },
    // 1. Reset Code Generation
    forgotPassword: async (email) => {
        try {
            const response = await API.post("/users/forgot-password", { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to process recovery request" };
        }
    },

    // 2. Verify Passcode 
    verifyResetCode: async (email, resetCode) => {
        try {
            const response = await API.post("/users/verify-reset-code", { email, resetCode });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Invalid or expired verification code" };
        }
    },

    // 3. Password Overwrite
    resetPassword: async (email, newPassword) => {
        try {
            const response = await API.post("/users/reset-password", { email, newPassword });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to overwrite database credentials" };
        }
    }
};