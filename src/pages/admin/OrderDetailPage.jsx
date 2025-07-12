import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice, formatDate } from '../../lib/utils';
import { 
  ArrowLeft, 
  Truck, 
  CreditCard, 
  User, 
  Package, 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Printer,
  Send,
  AlertCircle,
  Trash2,
  Loader2,
  ChevronDown
} from 'lucide-react';
import OrderService from '../../services/admin/order.service';
import { LoadingOverlay, EmptyState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast'; // Import custom toast

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [note, setNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ items: false, timeline: false });
  const { addToast } = useToast(); // Initialize custom toast

  const fetchOrder = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.getOrder(id);
      const orderData = response.order;
      setOrder({
        ...orderData,
        id: orderData._id,
        customer: {
          id: orderData.user?._id || 'N/A',
          name: orderData.user ? `${orderData.user.firstName || ''} ${orderData.user.lastName || ''}`.trim() : 'Guest',
          email: orderData.user?.email || 'N/A',
          phone: orderData.user?.phone || 'N/A'
        },
        date: orderData.createdAt,
        items: orderData.items.map(item => ({
          id: item._id,
          product_id: item.product?._id,
          name: item.name || 'Unknown Product',
          variant: item.variant || '',
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal || item.price * item.quantity
        })),
        timeline: orderData.timeline.map(event => ({
          id: event._id,
          date: event.timestamp,
          status: event.status,
          description: event.note || `Order status updated to ${event.status}`
        })),
        notes: orderData.notes.map(note => ({
          id: note._id,
          date: note.createdAt,
          content: note.content,
          createdBy: note.createdBy ? { firstName: note.createdBy.firstName || 'Admin', lastName: note.createdBy.lastName || '' } : { firstName: 'Admin' }
        })),
        shipping_address: {
          street: orderData.shippingAddress.street,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          postal_code: orderData.shippingAddress.postalCode,
          country: orderData.shippingAddress.country
        },
        payment_method: orderData.paymentInfo?.method || 'N/A',
        payment_id: orderData.paymentInfo?.transactionId || 'N/A',
        payment_status: orderData.paymentInfo?.status || 'N/A',
        shipping_method: orderData.shippingMethod || 'Standard Delivery',
        subtotal: orderData.subtotal,
        shipping: orderData.shippingFee,
        tax: orderData.tax,
        total: orderData.totalAmount,
        status: orderData.status
      });
      setStatusUpdate(orderData.status);
    } catch (err) {
      if (retryCount < 3) {
        addToast(`Retrying ${retryCount + 1} of 3...`, 'info');
        setTimeout(() => fetchOrder(retryCount + 1), 1000);
      } else {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
        addToast(err.message || 'Failed to load order details', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (statusUpdate && statusUpdate !== order.status) {
      try {
        const response = await OrderService.updateOrderStatus(id, statusUpdate);
        setOrder({
          ...order,
          status: response.order.status,
          timeline: response.order.timeline.map(event => ({
            id: event._id,
            date: event.timestamp,
            status: event.status,
            description: event.note || `Order status updated to ${event.status}`
          }))
        });
        addToast('Order status updated successfully', 'success');
      } catch (err) {
        console.error('Error updating status:', err);
        addToast(err.message || 'Failed to update order status', 'error');
      }
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      addToast('Note content cannot be empty', 'error');
      return;
    }
    if (note.trim().length > 1000) {
      addToast('Note cannot exceed 1000 characters', 'error');
      return;
    }
    try {
      const response = await OrderService.addOrderNote(id, { content: note.trim() });
      setOrder({
        ...order,
        notes: response.order.notes.map(note => ({
          id: note._id,
          date: note.createdAt,
          content: note.content,
          createdBy: note.createdBy ? { firstName: note.createdBy.firstName || 'Admin', lastName: note.createdBy.lastName || '' } : { firstName: 'Admin' }
        }))
      });
      setNote('');
      addToast('Note added successfully', 'success');
    } catch (err) {
      console.error('Error adding note:', err);
      addToast(err.message || 'Failed to add note', 'error');
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await OrderService.updateOrderStatus(id, 'cancelled');
      setOrder({
        ...order,
        status: response.order.status,
        timeline: response.order.timeline.map(event => ({
          id: event._id,
          date: event.timestamp,
          status: event.status,
          description: event.note || `Order status updated to ${event.status}`
        }))
      });
      setIsCancelDialogOpen(false);
      addToast('Order cancelled successfully', 'success');
    } catch (err) {
      console.error('Error cancelling order:', err);
      addToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || !refundReason) {
      addToast('Please provide refund amount and reason', 'error');
      return;
    }
    if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > order.total) {
      addToast('Invalid refund amount', 'error');
      return;
    }
    if (refundReason.trim().length > 1000) {
      addToast('Refund reason cannot exceed 1000 characters', 'error');
      return;
    }
    try {
      const response = await OrderService.initiateRefund(id, {
        amount: parseFloat(refundAmount),
        reason: refundReason.trim()
      });
      setOrder({
        ...order,
        status: response.order.status,
        payment_status: response.order.paymentInfo.status,
        timeline: response.order.timeline.map(event => ({
          id: event._id,
          date: event.timestamp,
          status: event.status,
          description: event.note || `Order status updated to ${event.status}`
        })),
        notes: response.order.notes.map(note => ({
          id: note._id,
          date: note.createdAt,
          content: note.content,
          createdBy: note.createdBy ? { firstName: note.createdBy.firstName || 'Admin', lastName: note.createdBy.lastName || '' } : { firstName: 'Admin' }
        }))
      });
      setIsRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      addToast('Refund processed successfully', 'success');
    } catch (err) {
      console.error('Error processing refund:', err);
      addToast(err.message || 'Failed to process refund', 'error');
    }
  };

  const handlePrintInvoice = () => {
    const printContent = `
      <html>
        <head><title>Invoice ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f7fafc; }
            .total { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Invoice ${order.id}</h1>
          <p>Customer: ${order.customer.name}</p>
          <p>Date: ${formatDate(order.date)}</p>
          <h2>Items</h2>
          <table>
            <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>
            ${order.items.map(item => `
              <tr>
                <td>${item.name} ${item.variant ? `(${item.variant})` : ''}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.subtotal)}</td>
              </tr>
            `).join('')}
          </table>
          <p>Subtotal: ${formatPrice(order.subtotal)}</p>
          <p>Shipping: ${formatPrice(order.shipping)}</p>
          ${order.tax > 0 ? `<p>Tax: ${formatPrice(order.tax)}</p>` : ''}
          <p class="total">Total: ${formatPrice(order.total)}</p>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSendEmail = async () => {
    try {
      const response = await OrderService.sendOrderEmail(id);
      setOrder({
        ...order,
        notes: response.order.notes.map(note => ({
          id: note._id,
          date: note.createdAt,
          content: note.content,
          createdBy: note.createdBy ? { firstName: note.createdBy.firstName || 'Admin', lastName: note.createdBy.lastName || '' } : { firstName: 'Admin' }
        }))
      });
      addToast('Email sent successfully', 'success');
    } catch (err) {
      console.error('Error sending email:', err);
      addToast(err.message || 'Failed to send email', 'error');
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <LoadingOverlay loading={loading}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </LoadingOverlay>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12 px-4">
        <ErrorState
          title="Order Not Found"
          message={error || 'The order you are looking for does not exist or has been removed.'}
          retryAction={fetchOrder}
        />
        <Link to="/admin/orders">
          <Button variant="outline" className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-100">
            <ArrowLeft size={16} className="mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order {order.id} | Scenture Lagos Admin</title>
      </Helmet>
      
      <div className="space-y-6 px-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <Link to="/admin/orders" className="mr-4">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order {order.id}
              </h1>
              <div className="flex items-center mt-1 text-gray-600">
                <Calendar size={14} className="mr-1" />
                <span>{formatDate(order.date)}</span>
                <span className="mx-2">•</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={handlePrintInvoice} 
              className="flex items-center border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <Printer size={16} className="mr-2" />
              Print Invoice
            </Button>
            <Button 
              variant="default" 
              onClick={handleSendEmail} 
              className="flex items-center bg-blue-600 text-white hover:bg-blue-700"
            >
              <Send size={16} className="mr-2" />
              Send Email
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Order Items</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Products included in this order</CardDescription>
                  </div>
                  <button 
                    onClick={() => toggleSection('items')} 
                    className="md:hidden flex items-center text-gray-600"
                  >
                    <ChevronDown size={20} className={`transition-transform duration-200 ${openSections.items ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left font-medium p-4 pl-0 text-gray-700">Product</th>
                        <th className="text-center font-medium p-4 text-gray-700">Quantity</th>
                        <th className="text-right font-medium p-4 text-gray-700">Price</th>
                        <th className="text-right font-medium p-4 pr-0 text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                          <td className="p-4 pl-0">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.variant && (
                              <div className="text-xs text-gray-500">Variant: {item.variant}</div>
                            )}
                          </td>
                          <td className="p-4 text-center text-gray-900">{item.quantity}</td>
                          <td className="p-4 text-right text-gray-900">{formatPrice(item.price)}</td>
                          <td className="p-4 pr-0 text-right font-medium text-gray-900">{formatPrice(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200">
                        <td colSpan="3" className="p-4 pl-0 text-right font-medium text-gray-900">Subtotal</td>
                        <td className="p-4 pr-0 text-right font-medium text-gray-900">{formatPrice(order.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="p-4 pl-0 text-right font-medium text-gray-900">Shipping</td>
                        <td className="p-4 pr-0 text-right font-medium text-gray-900">{formatPrice(order.shipping)}</td>
                      </tr>
                      {order.tax > 0 && (
                        <tr>
                          <td colSpan="3" className="p-4 pl-0 text-right font-medium text-gray-900">Tax</td>
                          <td className="p-4 pr-0 text-right font-medium text-gray-900">{formatPrice(order.tax)}</td>
                        </tr>
                      )}
                      <tr className="border-t border-gray-200">
                        <td colSpan="3" className="p-4 pl-0 text-right font-medium text-lg text-gray-900">Total</td>
                        <td className="p-4 pr-0 text-right font-medium text-lg text-gray-900">{formatPrice(order.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {/* Mobile Accordion View */}
                <div className="md:hidden">
                  {openSections.items && (
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.variant && (
                            <div className="text-xs text-gray-500">Variant: {item.variant}</div>
                          )}
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Quantity:</span> {item.quantity}
                            </div>
                            <div className="text-right">
                              <span className="text-gray-500">Price:</span> {formatPrice(item.price)}
                            </div>
                            <div className="col-span-2 text-right font-medium">
                              <span className="text-gray-500">Subtotal:</span> {formatPrice(item.subtotal)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Shipping</span>
                          <span className="font-medium text-gray-900">{formatPrice(order.shipping)}</span>
                        </div>
                        {order.tax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tax</span>
                            <span className="font-medium text-gray-900">{formatPrice(order.tax)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="font-medium text-gray-900">Total</span>
                          <span className="font-medium text-lg text-gray-900">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Order Timeline</CardTitle>
                    <CardDescription className="text-sm text-gray-500">History of order status changes</CardDescription>
                  </div>
                  <button 
                    onClick={() => toggleSection('timeline')} 
                    className="md:hidden flex items-center text-gray-600"
                  >
                    <ChevronDown size={20} className={`transition-transform duration-200 ${openSections.timeline ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                {/* Desktop Timeline View */}
                <div className="hidden md:block space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={event.id} className="flex">
                      <div className="mr-4 relative">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <Clock size={16} className="text-white" />
                        </div>
                        {index < order.timeline.length - 1 && (
                          <div className="absolute top-8 bottom-0 left-1/2 w-0.5 -ml-px bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{event.status}</h4>
                          <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mobile Timeline View */}
                <div className="md:hidden">
                  {openSections.timeline && (
                    <div className="space-y-3">
                      {order.timeline.map((event) => (
                        <div key={event.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{event.status}</h4>
                            <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Order Notes</CardTitle>
                <CardDescription className="text-sm text-gray-500">Internal notes for this order</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-4 mb-4">
                  {order.notes.length > 0 ? (
                    order.notes.map((noteItem) => (
                      <div key={noteItem.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {noteItem.createdBy?.firstName || 'Admin'} {noteItem.createdBy?.lastName || ''}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(noteItem.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{noteItem.content}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<FileText className="h-12 w-12 text-gray-300" />}
                      title="No Notes"
                      description="No notes have been added to this order yet."
                    />
                  )}
                </div>
                
                <div className="space-y-3">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note about this order..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-sm"
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!note.trim() || loading}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Order Actions</CardTitle>
                <CardDescription className="text-sm text-gray-500">Manage this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Update Order Status
                  </label>
                  <div className="flex">
                    <select
                      id="status"
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm"
                      disabled={loading}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <Button 
                      onClick={handleStatusUpdate} 
                      disabled={statusUpdate === order.status || loading}
                      className="rounded-l-none bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Update
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:border-red-200"
                    onClick={() => setIsCancelDialogOpen(true)}
                    disabled={order.status === 'cancelled' || loading}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Cancel Order
                  </Button>
                </div>
                
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => setIsRefundDialogOpen(true)}
                    disabled={order.payment_status !== 'paid' || order.status === 'refunded' || loading}
                  >
                    <CreditCard size={16} className="mr-2" />
                    Process Refund
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Customer</CardTitle>
                <CardDescription className="text-sm text-gray-500">Customer information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User size={16} className="mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">Customer ID: {order.customer.id}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail size={16} className="mr-2 mt-0.5 text-gray-400" />
                    <div className="text-sm text-gray-600">{order.customer.email}</div>
                  </div>
                  <div className="flex items-start">
                    <Phone size={16} className="mr-2 mt-0.5 text-gray-400" />
                    <div className="text-sm text-gray-600">{order.customer.phone}</div>
                  </div>
                  <div className="pt-2">
                    {order.customer.id !== 'N/A' && (
                      <Link to={`/admin/customers/${order.customer.id}`}>
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100">
                          View Customer Profile
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Shipping</CardTitle>
                <CardDescription className="text-sm text-gray-500">Delivery information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin size={16} className="mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Shipping Address</div>
                      <div className="text-sm text-gray-600">
                        {order.shipping_address.street}<br />
                        {order.shipping_address.city}, {order.shipping_address.state}<br />
                        {order.shipping_address.postal_code}<br />
                        {order.shipping_address.country}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Truck size={16} className="mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Shipping Method</div>
                      <div className="text-sm text-gray-600">{order.shipping_method}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Payment</CardTitle>
                <CardDescription className="text-sm text-gray-500">Transaction details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CreditCard size={16} className="mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Payment Method</div>
                      <div className="text-sm text-gray-600">{order.payment_method}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText size={16} className="mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Transaction ID</div>
                      <div className="text-sm text-gray-600">{order.payment_id}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-5 mr-2"></div>
                    <div>
                      <div className="font-medium text-gray-900">Payment Status</div>
                      <div className="mt-1">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.payment_status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
          <DialogContent className="rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">Process Refund</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700">
                  Refund Amount
                </label>
                <input
                  id="refundAmount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter refund amount"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  min="0"
                  max={order.total}
                />
              </div>
              <div>
                <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700">
                  Refund Reason
                </label>
                <textarea
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter reason for refund"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsRefundDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRefund} 
                disabled={!refundAmount || !refundReason || loading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Process Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">Cancel Order</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel order {order.id}? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCancelDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                No, Keep Order
              </Button>
              <Button 
                variant="outline" 
                className="text-red-600 hover:bg-red-50 hover:border-red-200"
                onClick={handleCancelOrder}
                disabled={loading}
              >
                Yes, Cancel Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default OrderDetailPage;