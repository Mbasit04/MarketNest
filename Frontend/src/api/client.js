import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5196/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mn_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("mn_token");
      localStorage.removeItem("mn_user");
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register"))
        window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ---------- Auth ----------
export const authApi = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  applySeller: (data) => api.post("/seller/apply", data).then((r) => r.data),
};

// ---------- Catalog ----------
export const catalogApi = {
  products: (params) => api.get("/catalog/products", { params }).then((r) => r.data),
  product: (id) => api.get(`/catalog/products/${id}`).then((r) => r.data),
  categories: () => api.get("/catalog/categories").then((r) => r.data),
  featured: () => api.get("/catalog/featured").then((r) => r.data),
};

// ---------- Customer ----------
export const customerApi = {
  getCart: () => api.get("/customer/cart").then((r) => r.data),
  addToCart: (data) => api.post("/customer/cart/add", data).then((r) => r.data),
  updateItem: (id, data) => api.put(`/customer/cart/items/${id}`, data).then((r) => r.data),
  removeItem: (id) => api.delete(`/customer/cart/items/${id}`).then((r) => r.data),
  clearCart: () => api.delete("/customer/cart").then((r) => r.data),
  checkout: (data) => api.post("/customer/checkout", data).then((r) => r.data),
  orders: () => api.get("/customer/orders").then((r) => r.data),
  order: (id) => api.get(`/customer/orders/${id}`).then((r) => r.data),
  cancelOrder: (id) => api.post(`/customer/orders/${id}/cancel`).then((r) => r.data),
  addReview: (data) => api.post("/customer/reviews", data).then((r) => r.data),
};

// ---------- Seller ----------
export const sellerApi = {
  me: () => api.get("/seller/me").then((r) => r.data),
  dashboard: () => api.get("/seller/dashboard").then((r) => r.data),
  products: () => api.get("/seller/products").then((r) => r.data),
  addProduct: (data) => api.post("/seller/products", data).then((r) => r.data),
  updateProduct: (id, data) => api.put(`/seller/products/${id}`, data).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/seller/products/${id}`).then((r) => r.data),
  orders: (status) => api.get("/seller/orders", { params: status ? { status } : {} }).then((r) => r.data),
  updateOrderStatus: (id, data) => api.put(`/seller/orders/${id}/status`, data).then((r) => r.data),
};

// ---------- Admin ----------
export const adminApi = {
  dashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  sellers: (status) => api.get("/admin/sellers", { params: status ? { status } : {} }).then((r) => r.data),
  sellerDetail: (id) => api.get(`/admin/sellers/${id}`).then((r) => r.data),
  reviewSeller: (id, data) => api.post(`/admin/sellers/${id}/review`, data).then((r) => r.data),
  suspend: (id) => api.post(`/admin/sellers/${id}/suspend`).then((r) => r.data),
  reactivate: (id) => api.post(`/admin/sellers/${id}/reactivate`).then((r) => r.data),
  categories: () => api.get("/admin/categories").then((r) => r.data),
  addCategory: (data) => api.post("/admin/categories", data).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),
  products: () => api.get("/admin/products").then((r) => r.data),
  approveProduct: (id) => api.post(`/admin/products/${id}/approve`).then((r) => r.data),
  rejectProduct: (id) => api.post(`/admin/products/${id}/reject`).then((r) => r.data),
  orders: () => api.get("/admin/orders").then((r) => r.data),
  order: (id) => api.get(`/admin/orders/${id}`).then((r) => r.data),
  customers: () => api.get("/admin/customers").then((r) => r.data),
  getCommission: () => api.get("/admin/commission").then((r) => r.data),
  setCommission: (data) => api.post("/admin/commission", data).then((r) => r.data),
  reports: () => api.get("/admin/reports/summary").then((r) => r.data),
};

// ---------- Upload ----------
export const uploadApi = {
  upload: (file, folder) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/upload", form, { params: { folder }, headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
  },
};