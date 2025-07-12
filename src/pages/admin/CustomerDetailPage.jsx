import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
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
import CustomerService from '../../services/admin/customer.service';
import { LoadingOverlay, LoadingState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import {useToast} from '../../components/ui/Toast';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {addToast} = useToast();
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
      setTotalOrders(ordersResponse.data.total);
      setReviews(Array.isArray(reviewsResponse.data.data) ? reviewsResponse.data.data : []);
      setTotalReviews(reviewsResponse.data.total);
      setNotes(Array.isArray(notesResponse.data.notes) ? notesResponse.data.notes : []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer data');
      setLoading(false);
      addToast(err.response?.data?.message || 'Failed to load customer data', 'error');
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
      const newNote = {
        id: Date.now(),
        content: note,
        author: 'Current User',
        date: new Date().toISOString(),
      };
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setNote('');

      const response = await CustomerService.addCustomerNote(id, { content: note });

      if (response.data.notes) {
        setNotes(Array.isArray(response.data.notes) ? response.data.notes : []);
      } else if (response.data.note) {
        setNotes((prevNotes) =>
          prevNotes.map((n) => (n.id === newNote.id ? response.data.note : n))
        );
      } else {
        const notesResponse = await CustomerService.getCustomerNotes(id);
        setNotes(Array.isArray(notesResponse.data.notes) ? notesResponse.data.notes : []);
      }

      addToast('Note added successfully', 'success');
    } catch (err) {
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== Date.now()));
      addToast(err.response?.data?.error || 'Failed to add note', 'error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await CustomerService.deleteCustomerNote(id, noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      addToast('Note deleted successfully','success');
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

  const handleOrderPageChange = (pageNumber) => {
    setOrderPage(pageNumber);
  };

  const handleReviewPageChange = (pageNumber) => {
    setReviewPage(pageNumber);
  };

  if (loading) {
    return <LoadingState fullPage={false} className="py-12 px-4 sm:px-6" />;
  }

  if (error || !customer) {
    return (
      <ErrorState
        title="Failed to load customer"
        message={error || 'Customer not found'}
        onRetry={fetchCustomerData}
        className="py-12 px-4 sm:px-6"
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{customer.name} | Scenture Lagos Admin</title>
      </Helmet>

      <div className="space-y-6 px-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center">
            <Link to="/admin/customers" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary">{customer.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center mt-1 text-secondary/70 text-sm gap-2">
                <span>{customer.id}</span>
                <span className="hidden sm:inline mx-2">•</span>
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  <span>Customer since {customer.created_at}</span>
                </div>
                <span className="hidden sm:inline mx-2">•</span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {customer.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to={`/admin/customers/${customer.id}/edit`}>
              <Button variant="default" className="flex items-center">
                <Edit size={16} className="mr-2" />
                Edit Customer
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 sm:px-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="border-b border-slate-200">
                <div className="flex overflow-x-auto">
                  {['orders', 'reviews', 'notes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 font-medium text-sm whitespace-nowrap flex-1 sm:flex-none ${
                        activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-slate-600'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                      {tab === 'orders' ? totalOrders : tab === 'reviews' ? totalReviews : notes.length || 0})
                    </button>
                  ))}
                </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                <LoadingOverlay loading={loading}>
                  {activeTab === 'orders' && (
                    <div className="space-y-4">
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <Card key={order.id} className="shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="font-medium">{order.id}</div>
                                  <div className="text-sm text-slate-500">{order.date}</div>
                                </div>
                                <div className="flex-1">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      order.status === 'delivered'
                                        ? 'bg-green-100 text-green-800'
                                        : order.status === 'processing'
                                        ? 'bg-blue-100 text-blue-800'
                                        : order.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : order.status === 'shipped'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </div>
                                <div className="flex-1 text-sm">
                                  {order.items} item{order.items !== 1 ? 's' : ''}
                                </div>
                                <div className="flex-1 text-right font-medium">{formatPrice(order.total)}</div>
                                <Link to={`/admin/orders/${order.id}`}>
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-slate-500 p-4">No orders found</div>
                      )}
                      {totalOrders > itemsPerPage && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                          <div className="text-sm text-slate-500">
                            Showing {(orderPage - 1) * itemsPerPage + 1} to{' '}
                            {Math.min(orderPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOrderPageChange(orderPage - 1)}
                              disabled={orderPage === 1 || loading}
                            >
                              <ChevronLeft size={16} />
                            </Button>
                            {Array.from({ length: Math.ceil(totalOrders / itemsPerPage) }, (_, i) => i + 1).map(
                              (page) => (
                                <Button
                                  key={page}
                                  variant={orderPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleOrderPageChange(page)}
                                  disabled={loading}
                                >
                                  {page}
                                </Button>
                              )
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOrderPageChange(orderPage + 1)}
                              disabled={orderPage === Math.ceil(totalOrders / itemsPerPage) || loading}
                            >
                              <ChevronRight size={16} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-4">
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <Card key={review.id} className="shadow-sm">
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
                                        size={16}
                                        className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm text-slate-500">{review.date}</span>
                                  </div>
                                  <p className="text-sm text-slate-600 mt-2">{review.content}</p>
                                </div>
                                <Link to={`/admin/products/${review.product_id}/reviews`}>
                                  <Button variant="outline" size="sm">
                                    View Product
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-slate-500 p-4">No reviews yet</div>
                      )}
                      {totalReviews > itemsPerPage && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                          <div className="text-sm text-slate-500">
                            Showing {(reviewPage - 1) * itemsPerPage + 1} to{' '}
                            {Math.min(reviewPage * itemsPerPage, totalReviews)} of {totalReviews} reviews
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewPageChange(reviewPage - 1)}
                              disabled={reviewPage === 1 || loading}
                            >
                              <ChevronLeft size={16} />
                            </Button>
                            {Array.from({ length: Math.ceil(totalReviews / itemsPerPage) }, (_, i) => i + 1).map(
                              (page) => (
                                <Button
                                  key={page}
                                  variant={reviewPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleReviewPageChange(page)}
                                  disabled={loading}
                                >
                                  {page}
                                </Button>
                              )
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewPageChange(reviewPage + 1)}
                              disabled={reviewPage === Math.ceil(totalReviews / itemsPerPage) || loading}
                            >
                              <ChevronRight size={16} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Add a note about this customer..."
                          className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          rows={3}
                        />
                        <Button onClick={handleAddNote} disabled={!note.trim() || loading} className="w-full">
                          Add Note
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {Array.isArray(notes) && notes.length > 0 ? (
                          notes.map((noteItem) => (
                            <Card key={noteItem.id} className="shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-secondary">{noteItem.author}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-500">{noteItem.date}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-800"
                                      onClick={() => handleDeleteNote(noteItem.id)}
                                      disabled={loading}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600">{noteItem.content}</p>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <p className="text-slate-500 text-center p-4">No notes added yet</p>
                        )}
                      </div>
                    </div>
                  )}
                </LoadingOverlay>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Contact details and address</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-slate-500">Customer ID: {customer.id}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div className="text-sm truncate">{customer.email}</div>
                  </div>
                  <div className="flex items-start">
                    <Phone size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div className="text-sm">{customer.phone || 'N/A'}</div>
                  </div>
                  <div className="flex items-start">
                    <MapPin size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div className="text-sm">
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

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle>Customer Stats</CardTitle>
                <CardDescription>Overview of customer activity</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingBag size={16} className="mr-2 text-slate-400" />
                      <span>Total Orders</span>
                    </div>
                    <span className="font-medium">{customer.total_orders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-slate-400" />
                      <span>Last Order</span>
                    </div>
                    <span className="font-medium">{orders[0]?.date || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star size={16} className="mr-2 text-slate-400" />
                      <span>Reviews</span>
                    </div>
                    <span className="font-medium">{totalReviews || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-slate-400" />
                      <span>Customer Since</span>
                    </div>
                    <span className="font-medium">{customer.created_at}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between font-medium text-lg">
                      <span>Total Spent</span>
                      <span className="text-primary">{formatPrice(customer.total_spent)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle>Customer Actions</CardTitle>
                <CardDescription>Manage customer status and flags</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleCustomerAction('vip')}
                  disabled={loading}
                >
                  <CheckCircle size={16} className={`mr-2 ${customer.isVip ? 'text-green-600' : 'text-slate-400'}`} />
                  {customer.isVip ? 'Remove VIP Status' : 'Mark as VIP'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleCustomerAction('flag')}
                  disabled={loading}
                >
                  <AlertCircle size={16} className={`mr-2 ${customer.isFlagged ? 'text-yellow-600' : 'text-slate-400'}`} />
                  {customer.isFlagged ? 'Remove Flag' : 'Flag for Review'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:border-red-200"
                  onClick={() => handleCustomerAction('deactivate')}
                  disabled={customer.status === 'inactive' || loading}
                >
                  <XCircle size={16} className="mr-2" />
                  {customer.status === 'inactive' ? 'Inactive' : 'Deactivate Account'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDetailPage;