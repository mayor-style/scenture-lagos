import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { RefreshProvider } from './contexts/RefreshContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AddCustomerPage from './pages/admin/AddCustomerPage';
import EditCustomerPage from './pages/admin/EditCustomerPage';
import InventoryHistory from './pages/admin/InventoryHistory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  state = { hasError: false, error: null, showDetails: false };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  toggleDetails = () => {
    this.setState(prev => ({ ...prev, showDetails: !prev.showDetails }));
  };

  handleGoBack = () => {
    // Use window.history to navigate back, as useNavigate isn't available in class components
    window.history.back();
  };

  handleTryAgain = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="min-h-screen flex items-center justify-center bg-slate-50 px-4"
        >
          <Card className="w-full max-w-lg border-slate-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle size={48} className="text-red-500" />
              </div>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Oops, Something Went Wrong
              </CardTitle>
              <CardDescription className="text-slate-500">
                An unexpected error occurred. Please try again or return to the previous page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={this.handleTryAgain}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoBack}
                  variant="outline"
                  className="text-slate-900 border-slate-200 hover:bg-slate-100"
                >
                  Go Back
                </Button>
              </div>
              <div className="text-center">
                <Button
                  onClick={this.toggleDetails}
                  variant="ghost"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  {this.state.showDetails ? (
                    <>
                      Hide Details <ChevronUp size={16} className="ml-2" />
                    </>
                  ) : (
                    <>
                      Show Details <ChevronDown size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
              <AnimatePresence>
                {this.state.showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-100 p-4 rounded-md text-sm text-slate-700 overflow-auto max-h-48"
                  >
                    <p>
                      <strong>Error Message:</strong> {this.state.error?.message || 'Unknown error'}
                    </p>
                    {this.state.error?.stack && (
                      <pre className="mt-2 text-xs text-slate-600">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <RefreshProvider>
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                    }
                  >
                    <Routes>
                      <Route element={<Layout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/shop/:category" element={<ShopPage />} />
                        <Route path="/product/:slug" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/account" element={<AccountPage />} />
                      </Route>
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
                </RefreshProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
};

export default App;