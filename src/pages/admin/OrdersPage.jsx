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
  AlertCircle
} from 'lucide-react';
import OrderService from '../../services/admin/order.service';
import { LoadingState, LoadingOverlay } from '../../components/ui/LoadingState';
import  ErrorState  from '../../components/ui/ErrorState';
import { toast } from 'react-hot-toast';

// Order status options for filtering
const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' }
];

// Payment status options for filtering
const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Payment Status' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Refunded', label: 'Refunded' },
  { value: 'Failed', label: 'Failed' }
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
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
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalOrders / itemsPerPage);
  
// Update fetchOrders to include fallback data
const fetchOrders = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      status: selectedStatus || undefined,
      payment_status: selectedPaymentStatus || undefined
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
    setOrders(data.orders || []);
    setTotalOrders(data.total || 0);
  } catch (err) {
    console.error('Error fetching orders:', err);
    setError(err.message || 'Failed to load orders');
    if (process.env.NODE_ENV === 'development') {
      setOrders([
        {
          id: 'SCL-20250707-0001',
          customer: 'Aisha Okeke',
          email: 'aisha@example.com',
          date: '2025-07-06',
          total: 18500,
          status: 'Delivered',
          payment_status: 'Paid'
        },
        {
          id: 'SCL-20250707-0002',
          customer: 'Chinedu Eze',
          email: 'chinedu@example.com',
          date: '2025-07-06',
          total: 9200,
          status: 'Processing',
          payment_status: 'Pending'
        }
      ]);
      setTotalOrders(2);
    } else {
      setOrders([]);
      setTotalOrders(0);
      toast.error(err.message || 'Failed to load orders');
    }
  } finally {
    setLoading(false);
  }
};

// Add export functionality
const handleExportOrders = () => {
  if (!orders.length) {
    toast.error('No orders to export');
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
    setCurrentPage(1); // Reset to first page when searching
    fetchOrders();
  };
  
  // Handle status filter change
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle payment status filter change
  const handlePaymentStatusChange = (e) => {
    setSelectedPaymentStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchOrders();
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
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-medium text-secondary">Orders</h1>
            <p className="text-secondary/70 mt-1">Manage customer orders</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={handleExportOrders}
            disabled={loading || !orders.length}
            className="flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export Orders
          </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isPolling) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
                setIsPolling(false);
                toast.success('Real-time updates disabled');
              } else {
                const interval = setInterval(() => fetchOrders(), 30000); // Poll every 30 seconds
                setPollingInterval(interval);
                setIsPolling(true);
                toast.success('Real-time updates enabled');
              }
            }}
            disabled={loading}
            className="flex items-center"
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

        <Card>
          <CardHeader>
            <CardTitle>Order List</CardTitle>
            <CardDescription>View and manage all customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </form>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    disabled={loading}
                  >
                    {ORDER_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
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
            
            <LoadingOverlay loading={loading} className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-medium p-3 pl-0">Order ID</th>
                    <th className="text-left font-medium p-3">Customer</th>
                    <th className="text-left font-medium p-3">Date</th>
                    <th className="text-left font-medium p-3">Total</th>
                    <th className="text-left font-medium p-3">Status</th>
                    <th className="text-left font-medium p-3">Payment</th>
                    <th className="text-right font-medium p-3 pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 pl-0 font-medium">{order.id}</td>
                        <td className="p-3">
                          <div>{order.customer}</div>
                          <div className="text-xs text-slate-500">{order.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1 text-slate-400" />
                            {formatDate(order.date)}
                          </div>
                        </td>
                        <td className="p-3">{formatPrice(order.total)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                            order.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.payment_status === 'Refunded' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="p-3 pr-0 text-right">
                          <Link to={`/admin/orders/${order.id}`} className="inline-flex p-2 text-slate-500 hover:text-secondary rounded-md hover:bg-slate-100">
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-3 text-center text-slate-500">
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
            </LoadingOverlay>

            {/* Pagination */}
            {totalOrders > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  {totalPages <= 5 ? (
                    // Show all pages if 5 or fewer
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                      >
                        {page}
                      </Button>
                    ))
                  ) : (
                    // Show limited pages with ellipsis for many pages
                    <>
                      {/* First page */}
                      <Button
                        variant={currentPage === 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={loading}
                      >
                        1
                      </Button>
                      
                      {/* Ellipsis or second page */}
                      {currentPage > 3 && (
                        <span className="px-2">...</span>
                      )}
                      
                      {/* Pages around current page */}
                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (currentPage <= 2) {
                            // Near start
                            pageNum = i + 2;
                          } else if (currentPage >= totalPages - 1) {
                            // Near end
                            pageNum = totalPages - 3 + i;
                          } else {
                            // Middle
                            pageNum = currentPage - 1 + i;
                          }
                          
                          // Only show if within range
                          if (pageNum > 1 && pageNum < totalPages) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={loading}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          return null;
                        }
                      ).filter(Boolean)}
                      
                      {/* Ellipsis or second-to-last page */}
                      {currentPage < totalPages - 2 && (
                        <span className="px-2">...</span>
                      )}
                      
                      {/* Last page */}
                      <Button
                        variant={currentPage === totalPages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={loading}
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