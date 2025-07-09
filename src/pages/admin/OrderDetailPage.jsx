import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
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
  Trash2
} from 'lucide-react';
import OrderService from '../../services/admin/order.service';
import { LoadingOverlay, EmptyState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';

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

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.getOrder(id);
      setOrder(response.order);
      setStatusUpdate(response.order.status);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to load order details');
      toast.error(err.message || 'Failed to load order details');
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
        setOrder(response.order);
        toast.success('Order status updated successfully');
      } catch (err) {
        console.error('Error updating status:', err);
        toast.error(err.message || 'Failed to update order status');
      }
    }
  };

  const handleAddNote = async () => {
    if (note.trim()) {
      try {
        const response = await OrderService.addOrderNote(id, { content: note.trim() });
        setOrder(response.order);
        setNote('');
        toast.success('Note added successfully');
      } catch (err) {
        console.error('Error adding note:', err);
        toast.error(err.message || 'Failed to add note');
      }
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await OrderService.updateOrderStatus(id, 'cancelled');
      setOrder(response.order);
      setIsCancelDialogOpen(false);
      toast.success('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error(err.message || 'Failed to cancel order');
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || !refundReason) {
      toast.error('Please provide refund amount and reason');
      return;
    }
    try {
      const response = await OrderService.initiateRefund(id, {
        amount: parseFloat(refundAmount),
        reason: refundReason
      });
      setOrder(response.order);
      setIsRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      toast.success('Refund processed successfully');
    } catch (err) {
      console.error('Error processing refund:', err);
      toast.error(err.message || 'Failed to process refund');
    }
  };

  const handlePrintInvoice = () => {
    const printContent = `
      <html>
        <head><title>Invoice ${order.id}</title></head>
        <body>
          <h1>Invoice ${order.id}</h1>
          <p>Customer: ${order.customer.name}</p>
          <p>Date: ${order.date}</p>
          <h2>Items</h2>
          <table border="1">
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
          <p><strong>Total: ${formatPrice(order.total)}</strong></p>
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
      toast.success('Email sent successfully');
    } catch (err) {
      console.error('Error sending email:', err);
      toast.error(err.message || 'Failed to send email');
    }
  };

  if (loading) {
    return (
      <LoadingOverlay loading={loading}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-secondary">Loading order details...</p>
          </div>
        </div>
      </LoadingOverlay>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <ErrorState
          title="Order Not Found"
          message={error || 'The order you are looking for does not exist or has been removed.'}
          retryAction={fetchOrder}
        />
        <Link to="/admin/orders">
          <Button variant="default" className="mt-4">
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
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <Link to="/admin/orders" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-medium text-secondary">
                Order {order.id}
              </h1>
              <div className="flex items-center mt-1 text-secondary/70">
                <Calendar size={14} className="mr-1" />
                <span>{formatDate(order.date)}</span>
                <span className="mx-2">•</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <Button variant="outline" onClick={handlePrintInvoice} className="flex items-center">
              <Printer size={16} className="mr-2" />
              Print Invoice
            </Button>
            <Button variant="default" onClick={handleSendEmail} className="flex items-center">
              <Send size={16} className="mr-2" />
              Send Email
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Products included in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left font-medium p-3 pl-0">Product</th>
                        <th className="text-center font-medium p-3">Quantity</th>
                        <th className="text-right font-medium p-3">Price</th>
                        <th className="text-right font-medium p-3 pr-0">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3 pl-0">
                            <div className="font-medium">{item.name}</div>
                            {item.variant && (
                              <div className="text-xs text-slate-500">Variant: {item.variant}</div>
                            )}
                          </td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">{formatPrice(item.price)}</td>
                          <td className="p-3 pr-0 text-right font-medium">{formatPrice(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200">
                        <td colSpan="3" className="p-3 pl-0 text-right font-medium">Subtotal</td>
                        <td className="p-3 pr-0 text-right font-medium">{formatPrice(order.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="p-3 pl-0 text-right font-medium">Shipping</td>
                        <td className="p-3 pr-0 text-right font-medium">{formatPrice(order.shipping)}</td>
                      </tr>
                      {order.tax > 0 && (
                        <tr>
                          <td colSpan="3" className="p-3 pl-0 text-right font-medium">Tax</td>
                          <td className="p-3 pr-0 text-right font-medium">{formatPrice(order.tax)}</td>
                        </tr>
                      )}
                      <tr className="border-t border-slate-200">
                        <td colSpan="3" className="p-3 pl-0 text-right font-medium text-lg">Total</td>
                        <td className="p-3 pr-0 text-right font-medium text-lg">{formatPrice(order.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
                <CardDescription>History of order status changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={event.id} className="flex">
                      <div className="mr-4 relative">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Clock size={16} className="text-secondary" />
                        </div>
                        {index < order.timeline.length - 1 && (
                          <div className="absolute top-8 bottom-0 left-1/2 w-0.5 -ml-px bg-slate-200"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-secondary">{event.status}</h4>
                          <span className="text-xs text-slate-500">{formatDate(event.date)}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
                <CardDescription>Internal notes for this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {order.notes.length > 0 ? (
                    order.notes.map((noteItem) => (
                      <div key={noteItem.id} className="bg-slate-50 p-4 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-secondary">{noteItem.createdBy?.firstName || 'Admin'}</span>
                          <span className="text-xs text-slate-500">{formatDate(noteItem.date)}</span>
                        </div>
                        <p className="text-sm text-slate-600">{noteItem.content}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<FileText className="h-12 w-12 text-secondary/30" />}
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
                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!note.trim() || loading}
                    className="w-full"
                  >
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
                <CardDescription>Manage this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-secondary mb-1">
                    Update Order Status
                  </label>
                  <div className="flex">
                    <select
                      id="status"
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                      disabled={loading}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <Button 
                      onClick={handleStatusUpdate} 
                      disabled={statusUpdate === order.status || loading}
                      className="rounded-l-none"
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
                    disabled={order.status === 'Cancelled' || loading}
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
                    disabled={order.payment_status !== 'Paid' || order.status === 'Refunded' || loading}
                  >
                    <CreditCard size={16} className="mr-2" />
                    Process Refund
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
                <CardDescription>Customer information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-slate-500">Customer ID: {order.customer.id}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div className="text-sm">{order.customer.email}</div>
                  </div>
                  <div className="flex items-start">
                    <Phone size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div className="text-sm">{order.customer.phone || 'N/A'}</div>
                  </div>
                  <div className="pt-2">
                    <Link to={`/admin/customers/${order.customer.id}`}>
                      <Button variant="outline" className="w-full">
                        View Customer Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
                <CardDescription>Delivery information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div>
                      <div className="font-medium">Shipping Address</div>
                      <div className="text-sm text-slate-600">
                        {order.shipping_address.street}<br />
                        {order.shipping_address.city}, {order.shipping_address.state}<br />
                        {order.shipping_address.postal_code}<br />
                        {order.shipping_address.country}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Truck size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div>
                      <div className="font-medium">Shipping Method</div>
                      <div className="text-sm text-slate-600">{order.shipping_method || 'Standard Delivery'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Transaction details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CreditCard size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div>
                      <div className="font-medium">Payment Method</div>
                      <div className="text-sm text-slate-600">{order.payment_method || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div>
                      <div className="font-medium">Transaction ID</div>
                      <div className="text-sm text-slate-600">{order.payment_id || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-5 mr-2"></div>
                    <div>
                      <div className="font-medium">Payment Status</div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.payment_status === 'Refunded' ? 'bg-blue-100 text-blue-800' :
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

        {/* Refund Dialog */}
        <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Refund</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="refundAmount" className="block text-sm font-medium text-secondary">
                  Refund Amount
                </label>
                <input
                  id="refundAmount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter refund amount"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label htmlFor="refundReason" className="block text-sm font-medium text-secondary">
                  Refund Reason
                </label>
                <textarea
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter reason for refund"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRefund} disabled={!refundAmount || !refundReason}>
                Process Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Order Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              Are you sure you want to cancel order {order.id}? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                No, Keep Order
              </Button>
              <Button variant="destructive" onClick={handleCancelOrder}>
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