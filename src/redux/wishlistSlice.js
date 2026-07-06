import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [], // [productObj]
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    wishlistStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setWishlist: (state, action) => {
      state.loading = false;
      state.products = action.payload.products || [];
    },
    wishlistFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearWishlistState: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
    }
  }
});

export const { wishlistStart, setWishlist, wishlistFailure, clearWishlistState } = wishlistSlice.actions;

export default wishlistSlice.reducer;
