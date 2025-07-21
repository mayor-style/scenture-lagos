import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Calendar,
  Edit,
  ShoppingBag,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { formatPrice, formatDate } from '../../lib/utils';
import CustomerService from '../../services/admin/customer.service';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [orderPage, setOrderPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const itemsPerPage = 10;

  const statusStyles = {
    delivered: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-destructive/20 text-destructive',
    refunded: 'bg-blue-200 text-blue-900',
  };

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [customerResponse, ordersResponse, reviewsResponse, notesResponse] = await Promise.all([
        CustomerService.getCustomer(id),
        CustomerService.getCustomerOrders(id, { page: orderPage, limit: itemsPerPage }),
        CustomerService.getCustomerReviews(id, { page: reviewPage, limit: itemsPerPage }),
        CustomerService.getCustomerNotes(id),
      ]);
      setCustomer(customerResponse.data.customer);
      setOrders(Array.isArray(ordersResponse.data.data) ? ordersResponse.data.data : []);
      setTotalOrders(ordersResponse.data.total || 0);
      setReviews(Array.isArray(reviewsResponse.data.data) ? reviewsResponse.data.data : []);
      setTotalReviews(reviewsResponse.data.total || 0);
      setNotes(Array.isArray(notesResponse.data.notes) ? notesResponse.data.notes : []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer data');
      addToast(err.response?.data?.message || 'Failed to load customer data', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id, orderPage, reviewPage]);

  const handleAddNote = async () => {
    if (!note.trim()) {
      addToast('Please enter a note', 'error');
      return;
    }
    try {
      const newNote = { id: Date.now(), content: note, author: 'Current User', date: new Date().toISOString() };
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setNote('');
      const response = await CustomerService.addCustomerNote(id, { content: note });
      setNotes(Array.isArray(response.data.notes) ? response.data.notes : []);
      addToast('Note added successfully', 'success');
    } catch (err) {
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== Date.now()));
      addToast(err.response?.data?.message || 'Failed to add note', 'error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await CustomerService.deleteCustomerNote(id, noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      addToast('Note deleted successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete note', 'error');
    }
  };

  const handleCustomerAction = async (action) => {
    try {
      let response;
      if (action === 'vip') {
        response = await CustomerService.updateCustomerVip(id, !customer.isVip);
      } else if (action === 'flag') {
        response = await CustomerService.updateCustomerFlag(id, !customer.isFlagged);
      } else if (action === 'deactivate') {
        response = await CustomerService.deactivateCustomer(id);
      }
      setCustomer(response.data.customer);
      addToast(`Customer ${action} action completed successfully`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${action} customer`, 'error');
    }
  };

  const getPaginationRange = (totalItems) => {
    const maxPagesToShow = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startPage = Math.max(1, orderPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return { startPage, endPage, pages, totalPages };
  };

  if (loading && !customer) {
    return (
      <LoadingOverlay loading={loading}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto py-12 px-4 sm:px-6"
        >
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading customer details...</p>
          </div>
        </motion.div>
      </LoadingOverlay>
    );
  }

  if (error || !customer) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto py-12 px-4 sm:px-6"
      >
        <ErrorState
          title="Failed to load customer"
          message={error || 'Customer not found'}
          onRetry={fetchCustomerData}
        />
      </motion.div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{customer.name} | Scenture Admin</title>
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
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center">
            <Link to="/admin/customers" className="mr-4">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10"
                aria-label="Back to customers"
              >
                <ArrowLeft className="h-5 w-5 text-secondary" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
                {customer.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center mt-1.5 text-muted-foreground text-sm gap-2">
                <span>{customer.id}</span>
                <span className="hidden sm:inline mx-2">•</span>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>Customer since {formatDate(customer.created_at)}</span>
                </div>
                <span className="hidden sm:inline mx-2">•</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to={`/admin/customers/${customer.id}/edit`}>
              <Button
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary-dark text-secondary"
                aria-label="Edit customer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Customer
              </Button>
            </Link>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <div className="border-b border-primary/20">
                  <div className="flex overflow-x-auto">
                    {['orders', 'reviews', 'notes'].map((tab) => (
                      <motion.button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        className={`px-4 py-3 font-medium text-sm whitespace-nowrap flex-1 sm:flex-none relative ${
                          activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                        }`}
                        aria-label={`View ${tab}`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                        {tab === 'orders' ? totalOrders : tab === 'reviews' ? totalReviews : notes.length})
                        {activeTab === tab && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            layoutId="tab-underline"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <LoadingOverlay loading={loading}>
                    {activeTab === 'orders' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <motion.div
                              key={order.id}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <Card className="border-primary/20 bg-background shadow-sm">
                                <CardContent className="p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="font-medium text-secondary">{order.id}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {formatDate(order.date)}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[order.status]}`}
                                      >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                      </span>
                                    </div>
                                    <div className="flex-1 text-sm">
                                      {order.items} item{order.items !== 1 ? 's' : ''}
                                    </div>
                                    <div className="flex-1 text-right font-medium text-secondary">
                                      {formatPrice(order.total)}
                                    </div>
                                    <Link to={`/admin/orders/${order.id}`}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-primary/10"
                                        aria-label={`View order ${order.id}`}
                                      >
                                        View
                                      </Button>
                                    </Link>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground p-4">No orders found</div>
                        )}
                        {totalOrders > itemsPerPage && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4"
                          >
                            <div className="text-sm text-muted-foreground">
                              Showing {(orderPage - 1) * itemsPerPage + 1} to{' '}
                              {Math.min(orderPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrderPage(orderPage - 1)}
                                disabled={orderPage === 1 || loading}
                                className="hover:bg-primary/10"
                                aria-label="Previous orders page"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              {getPaginationRange(totalOrders).pages.map((page) => (
                                <Button
                                  key={page}
                                  variant={orderPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setOrderPage(page)}
                                  disabled={loading}
                                  className={
                                    orderPage === page
                                      ? 'bg-primary hover:bg-primary-dark text-secondary'
                                      : 'hover:bg-primary/10'
                                  }
                                  aria-label={`Orders page ${page}`}
                                >
                                  {page}
                                </Button>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrderPage(orderPage + 1)}
                                disabled={orderPage === Math.ceil(totalOrders / itemsPerPage) || loading}
                                className="hover:bg-primary/10"
                                aria-label="Next orders page"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    {activeTab === 'reviews' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {reviews.length > 0 ? (
                          reviews.map((review) => (
                            <motion.div
                              key={review.id}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <Card className="border-primary/20 bg-background shadow-sm">
                                <CardContent className="p-4">
                                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div>
                                      <Link
                                        to={`/admin/products/${review.product_id}`}
                                        className="font-medium text-secondary hover:text-primary"
                                      >
                                        {review.product_name}
                                      </Link>
                                      <div className="flex items-center mt-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'
                                            }`}
                                          />
                                        ))}
                                        <span className="ml-2 text-sm text-muted-foreground">
                                          {formatDate(review.date)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-2">{review.content}</p>
                                    </div>
                                    <Link to={`/admin/products/${review.product_id}/reviews`}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-primary/10"
                                        aria-label={`View product ${review.product_name} reviews`}
                                      >
                                        View Product
                                      </Button>
                                    </Link>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground p-4">No reviews yet</div>
                        )}
                        {totalReviews > itemsPerPage && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4"
                          >
                            <div className="text-sm text-muted-foreground">
                              Showing {(reviewPage - 1) * itemsPerPage + 1} to{' '}
                              {Math.min(reviewPage * itemsPerPage, totalReviews)} of {totalReviews} reviews
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReviewPage(reviewPage - 1)}
                                disabled={reviewPage === 1 || loading}
                                className="hover:bg-primary/10"
                                aria-label="Previous reviews page"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              {getPaginationRange(totalReviews).pages.map((page) => (
                                <Button
                                  key={page}
                                  variant={reviewPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setReviewPage(page)}
                                  disabled={loading}
                                  className={
                                    reviewPage === page
                                      ? 'bg-primary hover:bg-primary-dark text-secondary'
                                      : 'hover:bg-primary/10'
                                  }
                                  aria-label={`Reviews page ${page}`}
                                >
                                  {page}
                                </Button>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReviewPage(reviewPage + 1)}
                                disabled={reviewPage === Math.ceil(totalReviews / itemsPerPage) || loading}
                                className="hover:bg-primary/10"
                                aria-label="Next reviews page"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    {activeTab === 'notes' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="space-y-3">
                          <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note about this customer..."
                            className="resize-none"
                            rows={3}
                            aria-label="Add customer note"
                          />
                          <Button
                            onClick={handleAddNote}
                            disabled={!note.trim() || loading}
                            className="w-full bg-primary hover:bg-primary-dark text-secondary"
                            aria-label="Add note"
                          >
                            Add Note
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <AnimatePresence>
                            {Array.isArray(notes) && notes.length > 0 ? (
                              notes.map((noteItem) => (
                                <motion.div
                                  key={noteItem.id}
                                  variants={cardVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                >
                                  <Card className="border-primary/20 bg-background shadow-sm">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-secondary">{noteItem.author}</span>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-muted-foreground">
                                            {formatDate(noteItem.date)}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteNote(noteItem.id)}
                                            disabled={loading}
                                            aria-label={`Delete note from ${noteItem.author}`}
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{noteItem.content}</p>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-muted-foreground p-4"
                              >
                                No notes added yet
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </LoadingOverlay>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-lg font-heading text-secondary">Customer Information</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Contact details and address
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-secondary">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">Customer ID: {customer.id}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground truncate">{customer.email}</div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">{customer.phone || 'N/A'}</div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        {customer.address?.street || 'N/A'}
                        {customer.address?.street && <br />}
                        {customer.address?.city && `${customer.address.city}, `}
                        {customer.address?.state}
                        {customer.address?.state && <br />}
                        {customer.address?.postal_code || 'N/A'}
                        {customer.address?.postal_code && <br />}
                        {customer.address?.country || 'Nigeria'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-lg font-heading text-secondary">Customer Stats</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Overview of customer activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Total Orders</span>
                      </div>
                      <span className="font-medium text-secondary">{customer.total_orders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Last Order</span>
                      </div>
                      <span className="font-medium text-secondary">
                        {orders[0] ? formatDate(orders[0].date) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Reviews</span>
                      </div>
                      <span className="font-medium text-secondary">{totalReviews || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Customer Since</span>
                      </div>
                      <span className="font-medium text-secondary">{formatDate(customer.created_at)}</span>
                    </div>
                    <div className="pt-2 border-t border-primary/20">
                      <div className="flex items-center justify-between font-medium text-lg">
                        <span>Total Spent</span>
                        <span className="text-primary">{formatPrice(customer.total_spent)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-lg font-heading text-secondary">Customer Actions</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Manage customer status and flags
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-primary/10"
                    onClick={() => handleCustomerAction('vip')}
                    disabled={loading}
                    aria-label={customer.isVip ? 'Remove VIP status' : 'Mark as VIP'}
                  >
                    <CheckCircle
                      className={`mr-2 h-4 w-4 ${customer.isVip ? 'text-green-600' : 'text-muted-foreground'}`}
                    />
                    {customer.isVip ? 'Remove VIP Status' : 'Mark as VIP'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-primary/10"
                    onClick={() => handleCustomerAction('flag')}
                    disabled={loading}
                    aria-label={customer.isFlagged ? 'Remove flag' : 'Flag for review'}
                  >
                    <AlertCircle
                      className={`mr-2 h-4 w-4 ${customer.isFlagged ? 'text-yellow-600' : 'text-muted-foreground'}`}
                    />
                    {customer.isFlagged ? 'Remove Flag' : 'Flag for Review'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                    onClick={() => handleCustomerAction('deactivate')}
                    disabled={customer.status === 'inactive' || loading}
                    aria-label={customer.status === 'inactive' ? 'Account inactive' : 'Deactivate account'}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {customer.status === 'inactive' ? 'Inactive' : 'Deactivate Account'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default CustomerDetailPage;