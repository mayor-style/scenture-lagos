import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AddCustomerPage from './pages/admin/AddCustomerPage';
import EditCustomerPage from './pages/admin/EditCustomerPage';
import InventoryHistory from './pages/admin/InventoryHistory';

// Lazy-loaded components for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

// Admin pages
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const ProductFormPage = lazy(() => import('./pages/admin/ProductFormPage'));
const CategoryPage = lazy(() => import('./pages/admin/CategoryPage'));
const CategoryFormPage = lazy(() => import('./pages/admin/CategoryFormPage'));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/admin/OrderDetailPage'));
const CustomersPage = lazy(() => import('./pages/admin/CustomersPage'));
const CustomerDetailPage = lazy(() => import('./pages/admin/CustomerDetailPage'));
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='bg-red-500' style={{ padding: '20px', textAlign: 'center' }}>
          <h1 className='dashboardHeading'>Something went wrong</h1>
          <p className='dashboardSubHeading'> An unexpected error occurred, please try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Error Boundary Component remains unchanged

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <LoadingSpinner size="lg" />
                    </div>
                  }
                >
              <Routes>
              {/* Public routes wrapped in Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:category" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Route>

              {/* Admin routes without Layout */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductFormPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="categories" element={<CategoryPage />} />
                <Route path="categories/new" element={<CategoryFormPage />} />
                <Route path="categories/:id" element={<CategoryFormPage />} />
                <Route path="categories/:id/:action" element={<CategoryFormPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/:id" element={<CustomerDetailPage />} />
                <Route path="customers/add" element={<AddCustomerPage />} />
                <Route path="customers/:id/edit" element={<EditCustomerPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="inventory/:id/history" element={<InventoryHistory />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
                </Suspense>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
};

export default App;