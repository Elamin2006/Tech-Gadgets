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
    }
};