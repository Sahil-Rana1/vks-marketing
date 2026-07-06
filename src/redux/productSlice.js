import { createSlice } from '@reduxjs/toolkit';

const storedRecentlyViewed = localStorage.getItem('vks_recently_viewed')
  ? JSON.parse(localStorage.getItem('vks_recently_viewed'))
  : [];

const initialState = {
  products: [],
  categories: [],
  totalProducts: 0,
  pages: 1,
  currentPage: 1,
  loading: false,
  error: null,
  
  // Single product detail
  currentProduct: null,
  relatedProducts: [],
  boughtTogether: [],
  productReviews: [],
  
  // Catalog filter state
  filters: {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    availability: '',
    sort: '',
    page: 1
  },
  
  // Extra features
  recentlyViewed: storedRecentlyViewed
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    productStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setProducts: (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.totalProducts = action.payload.total;
      state.pages = action.payload.pages;
      state.currentPage = action.payload.currentPage;
    },
    setCategories: (state, action) => {
      state.categories = action.payload.categories;
    },
    setCurrentProduct: (state, action) => {
      state.loading = false;
      state.currentProduct = action.payload.product;
      
      // Add to recently viewed (prevent duplicates, limit to 5 items)
      if (action.payload.product) {
        const filtered = state.recentlyViewed.filter(
          (p) => p._id !== action.payload.product._id
        );
        const updated = [action.payload.product, ...filtered].slice(0, 5);
        state.recentlyViewed = updated;
        localStorage.setItem('vks_recently_viewed', JSON.stringify(updated));
      }
    },
    setRelatedProducts: (state, action) => {
      state.relatedProducts = action.payload;
    },
    setBoughtTogether: (state, action) => {
      state.boughtTogether = action.payload;
    },
    setProductReviews: (state, action) => {
      state.productReviews = action.payload;
    },
    productFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        rating: '',
        availability: '',
        sort: '',
        page: 1
      };
    }
  }
});

export const {
  productStart,
  setProducts,
  setCategories,
  setCurrentProduct,
  setRelatedProducts,
  setBoughtTogether,
  setProductReviews,
  productFailure,
  updateFilters,
  resetFilters
} = productSlice.actions;

export default productSlice.reducer;
