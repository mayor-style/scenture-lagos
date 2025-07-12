import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice, formatDate } from '../../lib/utils';
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
  ChevronDown
} from 'lucide-react';
import OrderService from '../../services/admin/order.service';
import { LoadingState, LoadingOverlay } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';

// Order status options for filtering
const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
];

// Payment status options for filtering
const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Payment Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' }
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const {addToast} = useToast();
  // State for orders data
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(queryParams.get('status') || '');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(queryParams.get('payment_status') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page') || '1', 10));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(queryParams.get('limit') || '10', 10));
  
  // State for accordion (mobile)
  const [openOrder, setOpenOrder] = useState(null);
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalOrders / itemsPerPage);
  
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
        paymentStatus: selectedPaymentStatus || undefined
      };
      
      const searchParams = new URLSearchParams();
      if (currentPage > 1) searchParams.set('page', currentPage.toString());
      if (searchTerm) searchParams.set('search', searchTerm);
      if (selectedStatus) searchParams.set('status', selectedStatus);
      if (selectedPaymentStatus) searchParams.set('payment_status', selectedPaymentStatus);
      if (itemsPerPage !== 10) searchParams.set('limit', itemsPerPage.toString());
      
      const newUrl = `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      if (newUrl !== location.pathname + location.search) {
        navigate(newUrl, { replace: true });
      }
      
      const data = await OrderService.getOrders(params);
      if (!data.orders) {
        return addToast('No orders found matching your criteria', 'error');
      }

      setOrders(data.orders.map(order => ({
        ...order,
        id: order._id,
        customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
        email: order.user?.email || 'N/A',
        date: order.createdAt,
        total: order.totalAmount,
        payment_status: order.paymentInfo.status
      })));
      setTotalOrders(data.total);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      setOrders([]);
      setTotalOrders(0);
      addToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExportOrders = () => {
    if (!orders.length) {
      addToast('No orders to export', 'error');
      return;
    }
    
    const csvHeaders = [
      'Order ID',
      'Customer',
      'Email',
      'Date',
      'Total',
      'Status',
      'Payment Status'
    ];
    
    const csvRows = orders.map(order => [
      order.id,
      order.customer,
      order.email,
      formatDate(order.date),
      formatPrice(order.total),
      order.status,
      order.payment_status
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };
  
  // Handle status filter change
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };
  
  // Handle payment status filter change
  const handlePaymentStatusChange = (e) => {
    setSelectedPaymentStatus(e.target.value);
    setCurrentPage(1);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchOrders();
  };
  
  // Toggle accordion
  const toggleOrder = (orderId) => {
    setOpenOrder(openOrder === orderId ? null : orderId);
  };

  // Fetch orders when component mounts or when filters/pagination change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage]);

  // Add cleanup for polling
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <>
      <Helmet>
        <title>Orders | Scenture Lagos Admin</title>
      </Helmet>
      
      <div className="space-y-6 px-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center justify-center w-full sm:w-auto border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportOrders}
              disabled={loading || !orders.length}
              className="flex items-center justify-center w-full sm:w-auto border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isPolling) {
                  clearInterval(pollingInterval);
                  setPollingInterval(null);
                  setIsPolling(false);
                  addToast('Real-time updates disabled', 'success');
                } else {
                  const interval = setInterval(() => fetchOrders(), 60000);
                  setPollingInterval(interval);
                  setIsPolling(true);
                  addToast('Real-time updates enabled', 'success');
                }
              }}
              disabled={loading}
              className="flex items-center justify-center w-full sm:w-auto border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              {isPolling ? (
                <>
                  <Clock size={16} className="mr-2 animate-pulse" />
                  Stop Real-Time
                </>
              ) : (
                <>
                  <Clock size={16} className="mr-2" />
                  Start Real-Time
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-sm rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Order List</CardTitle>
            <CardDescription className="text-sm text-gray-500">View and manage all customer orders</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-col gap-4 mb-6">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name or email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </form>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white transition-all duration-200 text-sm"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    disabled={loading}
                  >
                    {ORDER_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="relative flex-1">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white transition-all duration-200 text-sm"
                    value={selectedPaymentStatus}
                    onChange={handlePaymentStatusChange}
                    disabled={loading}
                  >
                    {PAYMENT_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && !loading && (
              <ErrorState 
                message={error} 
                retryAction={fetchOrders} 
              />
            )}
            
            <LoadingOverlay loading={loading} className="relative">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left font-medium p-4 pl-0 text-gray-700">Order ID</th>
                      <th className="text-left font-medium p-4 text-gray-700">Customer</th>
                      <th className="text-left font-medium p-4 text-gray-700">Date</th>
                      <th className="text-left font-medium p-4 text-gray-700">Total</th>
                      <th className="text-left font-medium p-4 text-gray-700">Status</th>
                      <th className="text-left font-medium p-4 text-gray-700">Payment</th>
                      <th className="text-right font-medium p-4 pr-0 text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                          <td className="p-4 pl-0 font-medium text-gray-900">{order.id}</td>
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{order.customer}</div>
                            <div className="text-xs text-gray-500">{order.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1 text-gray-400" />
                              <span className="text-gray-900">{formatDate(order.date)}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-900">{formatPrice(order.total)}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                              order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.payment_status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="p-4 pr-0 text-right">
                            <Link 
                              to={`/admin/orders/${order.id}`} 
                              className="inline-flex p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100 transition-colors duration-150"
                            >
                              <Eye size={16} />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-gray-500">
                          {error ? (
                            <div className="flex items-center justify-center">
                              <AlertCircle size={16} className="mr-2 text-red-500" />
                              Error loading orders
                            </div>
                          ) : loading ? (
                            'Loading orders...'
                          ) : (
                            'No orders found matching your criteria'
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Accordion View */}
              <div className="md:hidden space-y-3">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden"
                    >
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="w-full flex justify-between items-center p-4 text-left transition-colors duration-150 hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{order.id}</div>
                          <div className="text-sm text-gray-500">{order.customer}</div>
                        </div>
                        <ChevronDown 
                          size={20} 
                          className={`text-gray-400 transition-transform duration-200 ${openOrder === order.id ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      {openOrder === order.id && (
                        <div className="p-4 pt-0 bg-gray-50 space-y-3">
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Email</div>
                            <div className="text-sm text-gray-900">{order.email}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Date</div>
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar size={14} className="mr-1 text-gray-400" />
                              {formatDate(order.date)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Total</div>
                            <div className="text-sm text-gray-900 font-medium">{formatPrice(order.total)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Status</div>
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Payment</div>
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                              order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.payment_status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.payment_status}
                            </span>
                          </div>
                          <div className="pt-2">
                            <Link 
                              to={`/admin/orders/${order.id}`} 
                              className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150"
                            >
                              <Eye size={16} className="mr-2" />
                              View Details
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
                    {error ? (
                      <div className="flex items-center justify-center">
                        <AlertCircle size={16} className="mr-2 text-red-500" />
                        Error loading orders
                      </div>
                    ) : loading ? (
                      'Loading orders...'
                    ) : (
                      'No orders found matching your criteria'
                    )}
                  </div>
                )}
              </div>
            </LoadingOverlay>

            {totalOrders > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  {totalPages <= 5 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                        className={currentPage === page ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                      >
                        {page}
                      </Button>
                    ))
                  ) : (
                    <>
                      <Button
                        variant={currentPage === 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={loading}
                        className={currentPage === 1 ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                      >
                        1
                      </Button>
                      {currentPage > 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (currentPage <= 2) {
                            pageNum = i + 2;
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 3 + i;
                          } else {
                            pageNum = currentPage - 1 + i;
                          }
                          if (pageNum > 1 && pageNum < totalPages) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={loading}
                                className={currentPage === pageNum ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          return null;
                        }
                      ).filter(Boolean)}
                      {currentPage < totalPages - 2 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <Button
                        variant={currentPage === totalPages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={loading}
                        className={currentPage === totalPages ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OrdersPage;