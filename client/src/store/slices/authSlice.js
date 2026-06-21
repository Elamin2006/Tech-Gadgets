import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthService } from "../../services/auth.service";

const savedUser = AuthService.getCurrentUser();

const initialState = {
    user: savedUser,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
};

export const login = createAsyncThunk(
    "auth/login",
    async ({ email, password }, thunkAPI) => {
        try {

            return await AuthService.login(email, password);
        } catch (error) {

            return thunkAPI.rejectWithValue(error.message || "Login failed");
        }
    }
);

// Thunk: (Register)
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, thunkAPI) => {
        try {
            return await AuthService.register(userData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || "Registration failed");
        }
    }
);

// Thunk: (Logout)
export const logoutUser = createAsyncThunk("auth/logout", async () => {
    AuthService.logout();
});

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetAuthState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload.data; 
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            // Register Cases 
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Logout Case
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
            });
    },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;