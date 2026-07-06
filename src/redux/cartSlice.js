import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // [{ product, quantity, color, size }]
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setCart: (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
    },
    cartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCartState: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    }
  }
});

export const { cartStart, setCart, cartFailure, clearCartState } = cartSlice.actions;

// Selectors for derived state
export const selectCartItemsCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((total, item) => {
    if (!item.product) return total;
    const priceAfterDiscount = item.product.price * (1 - item.product.discount / 100);
    return total + priceAfterDiscount * item.quantity;
  }, 0);

export default cartSlice.reducer;
