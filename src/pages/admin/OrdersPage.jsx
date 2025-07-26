import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useRef, useCallback
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { LoadingOverlay } from '../../components/ui/LoadingState'; // Removed LoadingState, as it's not directly used here
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { formatPrice, formatDate } from '../../lib/utils';
// CORRECTED IMPORT PATH for OrderService
import OrderService from '../../services/admin/order.service'; // Adjusted path to '../../services/OrderService'

const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Payment Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0); // This will now come directly from API service
  const [totalPages, setTotalPages] = useState(0); // Add state for totalPages
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null); // Use useRef for polling interval ID

  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(queryParams.get('status') || 'all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(queryParams.get('payment_status') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page') || '1', 10));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(queryParams.get('limit') || '10', 10)); // Can add a select input for this later

  const [openOrder, setOpenOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusStyles = {
    delivered: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-destructive/20 text-destructive',
    refunded: 'bg-blue-200 text-blue-900',
    paid: 'bg-green-100 text-green-800', // Added for payment status consistency
    failed: 'bg-destructive/20 text-destructive',
  };

  // useCallback to memoize fetchOrders and prevent unnecessary re-renders/effect triggers
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        paymentStatus: selectedPaymentStatus !== 'all' ? selectedPaymentStatus : undefined,
      };

      const searchParams = new URLSearchParams();
      // Only add to URL if they are not default values
      if (currentPage > 1) searchParams.set('page', currentPage.toString());
      if (searchTerm) searchParams.set('search', searchTerm);
      if (selectedStatus !== 'all') searchParams.set('status', selectedStatus);
      if (selectedPaymentStatus !== 'all') searchParams.set('payment_status', selectedPaymentStatus);
      if (itemsPerPage !== 10) searchParams.set('limit', itemsPerPage.toString());

      const newUrl = `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      // Use navigate with replace to avoid adding multiple history entries for filter/search changes
      if (newUrl !== location.pathname + location.search) {
        navigate(newUrl, { replace: true });
      }

      const data = await OrderService.getOrders(params);

      // No need for !data.orders check, as OrderService now returns an empty array if no orders
      setOrders(
        data.orders.map((order) => ({
          ...order,
          id: order._id, // Ensure consistent ID
          customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
          // Use shippingAddress.email for consistency across the board
          email: order.shippingAddress?.email || 'N/A',
          date: order.createdAt,
          total: order.totalAmount,
          payment_status: order.paymentInfo?.status, // Safely access paymentInfo.status
        }))
      );
      setTotalOrders(data.total);
      setTotalPages(data.pages); // Set total pages from API response

      if (data.orders.length === 0 && (searchTerm || selectedStatus !== 'all' || selectedPaymentStatus !== 'all')) {
        addToast('No orders found matching your criteria', 'info'); // Changed to 'info' as it's not an error from API but no results
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(0);
      addToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, selectedStatus, selectedPaymentStatus, location.pathname, location.search, navigate, addToast]); // Added fetchOrders dependencies

  // Effect to fetch orders whenever relevant parameters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // Dependency array now depends on memoized fetchOrders

  // Effect for polling mechanism
  useEffect(() => {
    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []); // Run only once on mount for cleanup setup

  const handleExportOrders = () => {
    if (!orders.length) {
      addToast('No orders to export', 'error');
      return;
    }

    const csvHeaders = ['Order ID', 'Order Number', 'Customer', 'Email', 'Date', 'Total', 'Status', 'Payment Status'];
    const csvRows = orders.map((order) => [
      order.id,
      order.orderNumber, // Include orderNumber in export
      order.customer,
      order.email,
      formatDate(order.date),
      formatPrice(order.total),
      order.status,
      order.payment_status,
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Orders exported successfully', 'success'); // Added success toast
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      setOpenOrder(null); // Close any open accordion when changing page
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    // fetchOrders will be triggered by useEffect due to searchTerm and currentPage change
  };

  const toggleOrder = (orderId) => {
    setOpenOrder(openOrder === orderId ? null : orderId);
  };

  const togglePolling = () => {
    if (isPolling) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      pollingIntervalRef.current = null;
      setIsPolling(false);
      addToast('Real-time updates disabled', 'success');
    } else {
      // Clear any existing interval before setting a new one
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      const interval = setInterval(() => {
        fetchOrders(); // Call the memoized fetchOrders
      }, 60000); // Poll every 60 seconds (1 minute)
      pollingIntervalRef.current = interval;
      setIsPolling(true);
      addToast('Real-time updates enabled', 'success');
    }
  };

  return (
    <>
      <Helmet>
        <title>Orders | Scenture Admin</title>
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto space-y-6 py-6 sm:py-8 px-4 sm:px-6 max-w-7xl"
      >
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
              Orders
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">Manage customer orders</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={loading}
              className="hover:bg-primary/10"
              aria-label="Refresh orders"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
           <Button
            variant="outline"
            size="sm"
            onClick={handleExportOrders}
            disabled={loading || orders.length === 0} // Changed from !orders.length for clarity
            className="hover:bg-primary/10"
            aria-label="Export orders"
          >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={togglePolling} // Call the refactored togglePolling
              disabled={loading}
              className="hover:bg-primary/10"
              aria-label={isPolling ? 'Stop real-time updates' : 'Start real-time updates'}
            >
              {isPolling ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-pulse" />
                  Stop Real-Time
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Start Real-Time
                </>
              )}
            </Button>
          </div>
        </motion.header>

        <motion.div variants={cardVariants}>
          <Card className="border-primary/20 bg-background shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-heading text-secondary">Order List</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                View and manage all customer orders
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex flex-col gap-4 mb-6">
                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="text"
                    placeholder="Search by order ID, customer name or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    aria-label="Search orders"
                  />
                </form>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-1/2" aria-label="Filter by order status">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                    <SelectTrigger className="w-full sm:w-1/2" aria-label="Filter by payment status">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="All Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <LoadingOverlay loading={loading}>
                {error && !loading ? (
                  <ErrorState message={error} retryAction={fetchOrders} />
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background border-b border-primary/20">
                          <tr>
                            <th className="text-left font-medium p-4 pl-0 text-secondary">Order Nos.</th>
                            <th className="text-left font-medium p-4 text-secondary">Customer</th>
                            <th className="text-left font-medium p-4 text-secondary">Date</th>
                            <th className="text-left font-medium p-4 text-secondary">Total</th>
                            <th className="text-left font-medium p-4 text-secondary">Status</th>
                            <th className="text-left font-medium p-4 text-secondary">Payment</th>
                            <th className="text-right font-medium p-4 pr-0 text-secondary">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {orders.length > 0 ? (
                              orders.map((order) => (
                                <motion.tr
                                  key={order.id}
                                  variants={rowVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="border-b border-primary/10 hover:bg-muted/50 transition-colors duration-150"
                                >
                                  <td className="p-4 pl-0 font-medium text-secondary">{order.orderNumber}</td>
                                  <td className="p-4">
                                    <div className="font-medium text-secondary">{order.customer}</div>
                                    {/* Consistent email source */}
                                    <div className="text-xs text-muted-foreground">{order.email}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center">
                                      <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                      <span className="text-secondary">{formatDate(order.date)}</span>
                                    </div>
                                  </td>
                                  <td className="p-4 text-secondary">{formatPrice(order.total)}</td>
                                  <td className="p-4">
                                    <span
                                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`} 
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span
                                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusStyles[order.payment_status] || 'bg-gray-100 text-gray-800'}`} 
                                    >
                                      {order.payment_status}
                                    </span>
                                  </td>
                                  <td className="p-4 pr-0 text-right">
                                    <Link
                                      to={`/admin/orders/${order.id}`}
                                      className="inline-flex p-2 text-secondary hover:text-primary rounded-md hover:bg-primary/10 transition-colors duration-150"
                                      aria-label={`View order ${order.orderNumber}`}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </td>
                                </motion.tr>
                              ))
                            ) : (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-primary/10"
                              >
                                <td colSpan="7" className="p-4 text-center text-muted-foreground">
                                  {loading ? (
                                    'Loading orders...'
                                  ) : (
                                    <div className="flex items-center justify-center">
                                      <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                                      No orders found matching your criteria
                                    </div>
                                  )}
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Accordion View */}
                    <div className="md:hidden space-y-3">
                      <AnimatePresence>
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <motion.div
                              key={order.id}
                              variants={rowVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="border border-primary/20 rounded-lg shadow-sm bg-background"
                            >
                              <button
                                onClick={() => toggleOrder(order.id)}
                                className="w-full flex justify-between items-center p-4 text-left transition-colors duration-150 hover:bg-muted/50"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-secondary text-sm">{order.orderNumber}</div>
                                  <div className="text-sm text-muted-foreground">{order.customer}</div>
                                </div>
                                <ChevronDown
                                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                                    openOrder === order.id ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                              {openOrder === order.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="p-4 pt-0 bg-muted/20 space-y-3"
                                >
                                  <div>
                                    <div className="text-xs text-muted-foreground font-medium">Email</div>
                                    <div className="text-sm text-secondary">{order.email}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground font-medium">Date</div>
                                    <div className="flex items-center text-sm text-secondary">
                                      <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                      {formatDate(order.date)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground font-medium">Total</div>
                                    <div className="text-sm text-secondary font-medium">{formatPrice(order.total)}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground font-medium">Status</div>
                                    <span
                                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}
                                    >
                                      {order.status}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground font-medium">Payment</div>
                                    <span
                                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusStyles[order.payment_status] || 'bg-gray-100 text-gray-800'}`}
                                    >
                                      {order.payment_status}
                                    </span>
                                  </div>
                                  <div className="pt-2">
                                    <Link
                                      to={`/admin/orders/${order.id}`}
                                      className="inline-flex items-center px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors duration-150"
                                      aria-label={`View order ${order.orderNumber}`}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </Link>
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 text-center text-muted-foreground bg-background border border-primary/20 rounded-lg"
                          >
                            {loading ? (
                              'Loading orders...'
                            ) : (
                              <div className="flex items-center justify-center">
                                <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                                No orders found matching your criteria
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </LoadingOverlay>

              {totalOrders > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of{' '}
                    {totalOrders} orders
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="hover:bg-primary/10"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {/* Render page numbers dynamically */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Logic to display a limited number of page buttons (e.g., 1, 2, ..., last)
                      // This aims to prevent too many page buttons from cluttering the UI
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            disabled={loading}
                            className={currentPage === page ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'} // Changed text-secondary to text-primary-foreground for button style consistency
                            aria-label={`Page ${page}`}
                          >
                            {page}
                          </Button>
                        );
                      }
                      // Display ellipsis for skipped pages
                      if (
                        (page === currentPage - 2 && currentPage > 3) ||
                        (page === currentPage + 2 && currentPage < totalPages - 2)
                      ) {
                        return <span key={page} className="px-2 text-muted-foreground">...</span>;
                      }
                      return null;
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="hover:bg-primary/10"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default OrdersPage;