import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SellerApplyPage from "./pages/auth/SellerApplyPage";

import HomePage from "./pages/customer/HomePage";
import SearchPage from "./pages/customer/SearchPage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import { OrdersListPage, OrderDetailPage } from "./pages/customer/OrdersPage";

import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import { SellerProductsListPage, SellerProductFormPage } from "./pages/seller/SellerProductsPage";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminSellersPage from "./pages/admin/AdminSellersPage";
import AdminCommissionPage from "./pages/admin/AdminCommissionPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/category/:id" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/seller/apply" element={<ProtectedRoute><SellerApplyPage /></ProtectedRoute>} />

            <Route path="/cart" element={<ProtectedRoute roles={["Customer"]}><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute roles={["Customer"]}><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute roles={["Customer"]}><OrdersListPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute roles={["Customer"]}><OrderDetailPage /></ProtectedRoute>} />

            <Route path="/seller" element={<ProtectedRoute roles={["Seller"]}><SellerDashboardPage /></ProtectedRoute>} />
            <Route path="/seller/products" element={<ProtectedRoute roles={["Seller"]}><SellerProductsListPage /></ProtectedRoute>} />
            <Route path="/seller/products/new" element={<ProtectedRoute roles={["Seller"]}><SellerProductFormPage /></ProtectedRoute>} />
            <Route path="/seller/orders" element={<ProtectedRoute roles={["Seller"]}><SellerOrdersPage /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute roles={["Admin"]}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/sellers" element={<ProtectedRoute roles={["Admin"]}><AdminSellersPage /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute roles={["Admin"]}><AdminProductsPage /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute roles={["Admin"]}><AdminOrdersPage /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute roles={["Admin"]}><AdminCategoriesPage /></ProtectedRoute>} />
            <Route path="/admin/commission" element={<ProtectedRoute roles={["Admin"]}><AdminCommissionPage /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute roles={["Admin"]}><AdminReportsPage /></ProtectedRoute>} />
            <Route path="/admin/customers" element={<ProtectedRoute roles={["Admin"]}><AdminCustomersPage /></ProtectedRoute>} />
          </Routes>
        </Layout>
        <ToastContainer position="top-right" autoClose={2500} />
      </AuthProvider>
    </BrowserRouter>
  );
}