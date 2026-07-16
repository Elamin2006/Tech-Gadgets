import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { CartService } from "../../services/customer/cart.service.js";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      return await CartService.getCart();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Failed to load cart");
    }
  },
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, quantity }, thunkAPI) => {
    try {
      return await CartService.addToCart(productId, quantity);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Failed to add item");
    }
  },
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItem",
  async (itemId, thunkAPI) => {
    try {
      return await CartService.removeFromCart(itemId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Failed to remove item");
    }
  },
);

export const clearUserCart = createAsyncThunk(
  "cart/clearCart",
  async (_, thunkAPI) => {
    try {
      return await CartService.clearCart();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Failed to clear cart");
    }
  },
);

const initialState = {
  cartList: [],
  totalCartPrice: 0,
  numOfCartItems: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartList = action.payload.data?.cartItems || [];
        state.totalCartPrice = action.payload.data?.totalCartPrice || 0;
        state.numOfCartItems = action.payload.numOfCartItems || 0;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(addItemToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartList = action.payload.data?.cartItems || [];
        state.totalCartPrice = action.payload.data?.totalCartPrice || 0;
        state.numOfCartItems = action.payload.numOfCartItems || 0;
        state.error = null;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(removeItemFromCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartList = action.payload.data?.cartItems || []; // 🟢 تم التصحيح هنا من cartItems إلى cartList ليعمل الـ UI فوراً
        state.totalCartPrice = action.payload.data?.totalCartPrice || 0;
        state.numOfCartItems = action.payload.numOfCartItems || 0;
        state.error = null;
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(clearUserCart.fulfilled, (state) => {
        return initialState;
      });
  },
});

export default cartSlice.reducer;
