import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { formatPrice, formatDate } from '../../lib/utils';
import OrderService from '../../services/admin/order.service';

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

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
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

  const statusStyles = {
    delivered: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-destructive/20 text-destructive',
    refunded: 'bg-blue-200 text-blue-900',
    failed: 'bg-destructive/20 text-destructive',
  };

  const fetchOrder = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.getOrder(id);
      const orderData = response.order;
      const formattedOrder = {
        ...orderData,
        id: orderData._id,
        orderNumber: orderData.orderNumber || orderData._id,
        customer: {
          id: orderData.user?._id || 'Guest',
          name: `${orderData.shippingAddress.firstName || ''} ${orderData.shippingAddress.lastName || ''}`.trim(),
          email: orderData.shippingAddress?.email || 'N/A',
          phone: orderData.shippingAddress?.phone || 'N/A',
        },
        date: orderData.createdAt,
        items: orderData.items.map((item) => ({
          id: item._id,
          product_id: item.product?._id,
          name: item.name || 'Unknown Product',
          variant: item.variant || '',
          price: item.price || 0,
          quantity: item.quantity || 1,
          subtotal: item.subtotal || (item.price || 0) * (item.quantity || 1),
        })),
        timeline: orderData.timeline.map((event) => ({
          id: event._id,
          date: event.timestamp,
          status: event.status,
          description: event.note || `Order status updated to ${event.status}`,
        })),
        notes: orderData.notes.map((note) => ({
          id: note._id,
          date: note.createdAt,
          content: note.content,
          createdBy: note.createdBy
            ? { firstName: note.createdBy.firstName || 'Admin', lastName: note.createdBy.lastName || '' }
            : { firstName: 'Admin' },
        })),
        shipping_address: {
          street: orderData.shippingAddress.street || '',
          city: orderData.shippingAddress.city || '',
          state: orderData.shippingAddress.state || '',
          postal_code: orderData.shippingAddress.postalCode || '',
          country: orderData.shippingAddress.country || '',
        },
        payment_method: orderData.paymentInfo?.method || 'N/A',
        payment_id: orderData.paymentInfo?.reference || 'N/A',
        payment_status: orderData.paymentInfo?.status || 'N/A',
        shipping_method: orderData.shippingMethod?.name || 'Standard Delivery',
        subtotal: orderData.subtotal || 0,
        shipping: orderData.shippingFee || 0,
        tax: orderData.taxAmount || 0,
        total: orderData.totalAmount || 0,
        status: orderData.status,
      };
      setOrder(formattedOrder);
      setStatusUpdate(orderData.status);
    } catch (err) {
      if (retryCount < 3) {
        addToast(`Retrying ${retryCount + 1} of 3...`, 'info');
        setTimeout(() => fetchOrder(retryCount + 1), 1000);
      } else {
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
          timeline: response.order.timeline.map((event) => ({
            id: event._id,
            date: event.timestamp,
            status: event.status,
            description: event.note || `Order status updated to ${event.status}`,
          })),
        });
        addToast('Order status updated successfully', 'success');
      } catch (err) {
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
        notes: response.order.notes.map((note) => ({
          id: note._id,
          date: note.createdAt,
          content: note.content,
          createdBy: note.createdBy
            ? { firstName: note.createdBy.firstName || 'Admin', lastName: note.createdBy.lastName || '' }
            : { firstName: 'Admin' },
        })),
      });
      setNote('');
      addToast('Note added successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to add note', 'error');
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await OrderService.updateOrderStatus(id, 'cancelled');
      setOrder({
        ...order,
        status: response.order.status,
        timeline: response.order.timeline.map((event) => ({
          id: event._id,
          date: event.timestamp,
          status: event.status,
          description: event.note || `Order status updated to ${event.status}`,
        })),
      });
      setIsCancelDialogOpen(false);
      addToast('Order cancelled successfully', 'success');
    } catch (err) {
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
        reason: refundReason.trim(),
      });
      setOrder({
        ...order,
        status: response.order.status,
        payment_status: response.order.paymentInfo.status,
        timeline: response.order.timeline.map((event) => ({
          id: event._id,
          date: event.timestamp,
          status: event.status,
          description: event.note || `Order status updated to ${event.status}`,
        })),
        notes: response.order.notes.map((note) => ({
          id: note._id,
          date: note.createdAt,
          content: note.content,
          createdBy: note.createdBy
            ? { firstName: note.createdBy.firstName || 'Admin', lastName: note.createdBy.lastName || '' }
            : { firstName: 'Admin' },
        })),
      });
      setIsRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      addToast('Refund processed successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to process refund', 'error');
    }
  };

  const handlePrintInvoice = () => {
    const printContent = `
      <html>
        <head>
          <title>Invoice ${order.orderNumber}</title>
          <style>
            body { font-family: 'Montserrat', sans-serif; margin: 20px; background: #FAF7F2; }
            h1 { font-family: 'Playfair Display', serif; color: #2D2D2D; font-size: 1.5rem; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid hsl(210, 40%, 96.1%); padding: 8px; text-align: left; }
            th { background: hsl(210, 40%, 96.1%); color: #2D2D2D; font-family: 'Playfair Display', serif; }
            .total { font-weight: 600; color: #2D2D2D; }
            p { color: #2D2D2D; }
          </style>
        </head>
        <body>
          <h1>Invoice ${order.orderNumber}</h1>
          <p>Customer: ${order.customer.name}</p>
          <p>Date: ${formatDate(order.date)}</p>
          <h2>Items</h2>
          <table>
            <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.name} ${item.variant ? `(${item.variant})` : ''}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.subtotal)}</td>
              </tr>
            `
              )
              .join('')}
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
        notes: response.order.notes.map((note) => ({
          id: note._id,
          date: note.createdAt,
          content: note.content,
          createdBy: note.createdBy
            ? { firstName: note.createdBy.firstName || 'Admin', lastName: note.createdBy.lastName || '' }
            : { firstName: 'Admin' },
        })),
      });
      addToast('Email sent successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to send email', 'error');
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <LoadingOverlay loading={loading}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-64"
        >
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
          </div>
        </motion.div>
      </LoadingOverlay>
    );
  }

  if (error || !order) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto text-center py-12 px-4 sm:px-6"
      >
        <ErrorState
          title="Order Not Found"
          message={error || 'The order you are looking for does not exist or has been removed.'}
          retryAction={fetchOrder}
        />
        <Link to="/admin/orders">
          <Button variant="outline" className="mt-4 hover:bg-primary/10" aria-label="Back to orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order {order.orderNumber} | Scenture Admin</title>
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
          <div className="flex items-center">
            <Link to="/admin/orders" className="mr-4">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10" aria-label="Back to orders">
                <ArrowLeft className="h-5 w-5 text-secondary" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
                Order {order.orderNumber}
              </h1>
              <div className="flex items-center mt-1.5 text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{formatDate(order.date)}</span>
                <span className="mx-2">•</span>
                <span
                  className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintInvoice}
              className="hover:bg-primary/10"
              aria-label="Print invoice"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSendEmail}
              className="bg-primary hover:bg-primary-dark text-secondary"
              aria-label="Send order email"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-heading text-secondary">Order Items</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Products included in this order
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => toggleSection('items')}
                      className="md:hidden flex items-center text-muted-foreground"
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-200 ${
                          openSections.items ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background border-b border-primary/20">
                        <tr>
                          <th className="text-left font-medium p-4 pl-0 text-secondary">Product</th>
                          <th className="text-center font-medium p-4 text-secondary">Quantity</th>
                          <th className="text-right font-medium p-4 text-secondary">Price</th>
                          <th className="text-right font-medium p-4 pr-0 text-secondary">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {order.items.map((item) => (
                            <motion.tr
                              key={item.id}
                              variants={rowVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="border-b border-primary/10 hover:bg-muted/50 transition-colors duration-150"
                            >
                              <td className="p-4 pl-0">
                                <div className="font-medium text-secondary">{item.name}</div>
                                {item.variant && (
                                  <div className="text-xs text-muted-foreground">Variant: {item.variant}</div>
                                )}
                              </td>
                              <td className="p-4 text-center text-secondary">{item.quantity}</td>
                              <td className="p-4 text-right text-secondary">{formatPrice(item.price)}</td>
                              <td className="p-4 pr-0 text-right font-medium text-secondary">
                                {formatPrice(item.subtotal)}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-primary/20">
                          <td colSpan="3" className="p-4 pl-0 text-right font-medium text-secondary">
                            Subtotal
                          </td>
                          <td className="p-4 pr-0 text-right font-medium text-secondary">
                            {formatPrice(order.subtotal)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="p-4 pl-0 text-right font-medium text-secondary">
                            Shipping
                          </td>
                          <td className="p-4 pr-0 text-right font-medium text-secondary">
                            {formatPrice(order.shipping)}
                          </td>
                        </tr>
                        {order.tax > 0 && (
                          <tr>
                            <td colSpan="3" className="p-4 pl-0 text-right font-medium text-secondary">
                              Tax
                            </td>
                            <td className="p-4 pr-0 text-right font-medium text-secondary">
                              {formatPrice(order.tax)}
                            </td>
                          </tr>
                        )}
                        <tr className="border-t border-primary/20">
                          <td colSpan="3" className="p-4 pl-0 text-right font-medium text-lg text-secondary">
                            Total
                          </td>
                          <td className="p-4 pr-0 text-right font-medium text-lg text-secondary">
                            {formatPrice(order.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="md:hidden">
                    <AnimatePresence>
                      {openSections.items && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-3"
                        >
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="border border-primary/20 rounded-lg p-4 bg-muted/20"
                            >
                              <div className="font-medium text-secondary">{item.name}</div>
                              {item.variant && (
                                <div className="text-xs text-muted-foreground">Variant: {item.variant}</div>
                              )}
                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Quantity:</span> {item.quantity}
                                </div>
                                <div className="text-right">
                                  <span className="text-muted-foreground">Price:</span> {formatPrice(item.price)}
                                </div>
                                <div className="col-span-2 text-right font-medium">
                                  <span className="text-muted-foreground">Subtotal:</span>{' '}
                                  {formatPrice(item.subtotal)}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span className="font-medium text-secondary">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping</span>
                              <span className="font-medium text-secondary">{formatPrice(order.shipping)}</span>
                            </div>
                            {order.tax > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-medium text-secondary">{formatPrice(order.tax)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-primary/20 pt-2">
                              <span className="font-medium text-secondary">Total</span>
                              <span className="font-medium text-lg text-secondary">
                                {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-heading text-secondary">Order Timeline</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        History of order status changes
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => toggleSection('timeline')}
                      className="md:hidden flex items-center text-muted-foreground"
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-200 ${
                          openSections.timeline ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="hidden md:block space-y-4">
                    <AnimatePresence>
                      {order.timeline.map((event, index) => (
                        <motion.div
                          key={event.id}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="flex"
                        >
                          <div className="mr-4 relative">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <Clock className="h-4 w-4 text-secondary" />
                            </div>
                            {index < order.timeline.length - 1 && (
                              <div className="absolute top-8 bottom-0 left-1/2 w-0.5 -ml-px bg-muted"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-secondary">{event.status}</h4>
                              <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="md:hidden">
                    <AnimatePresence>
                      {openSections.timeline && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-3"
                        >
                          {order.timeline.map((event) => (
                            <div
                              key={event.id}
                              className="border border-primary/20 rounded-lg p-4 bg-muted/20"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-secondary">{event.status}</h4>
                                <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-heading text-secondary">Order Notes</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Internal notes for this order
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4 mb-4">
                    <AnimatePresence>
                      {order.notes.length > 0 ? (
                        order.notes.map((noteItem) => (
                          <motion.div
                            key={noteItem.id}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="bg-muted/20 p-4 rounded-md border border-primary/20"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-secondary">
                                {noteItem.createdBy?.firstName || 'Admin'}{' '}
                                {noteItem.createdBy?.lastName || ''}
                              </span>
                              <span className="text-xs text-muted-foreground">{formatDate(noteItem.date)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{noteItem.content}</p>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center"
                        >
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                          <p className="mt-2 text-sm text-muted-foreground">No notes have been added to this order yet.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-3">
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note about this order..."
                      className="resize-none"
                      rows={3}
                      aria-label="Add order note"
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
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-heading text-secondary">Order Actions</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">Manage this order</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-secondary mb-1.5">
                      Update Order Status
                    </label>
                    <div className="flex">
                      <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                        <SelectTrigger
                          className="flex-1 rounded-r-none"
                          aria-label="Select order status"
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleStatusUpdate}
                        disabled={statusUpdate === order.status || loading}
                        className="rounded-l-none bg-primary hover:bg-primary-dark text-secondary"
                        aria-label="Update order status"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                      onClick={() => setIsCancelDialogOpen(true)}
                      disabled={order.status === 'cancelled' || loading}
                      aria-label="Cancel order"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel Order
                    </Button>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-primary hover:bg-primary/10 hover:border-primary/20"
                      onClick={() => setIsRefundDialogOpen(true)}
                      disabled={order.payment_status !== 'paid' || order.status === 'refunded' || loading}
                      aria-label="Process refund"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Process Refund
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-heading text-secondary">Customer</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Customer information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-secondary">{order.customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Customer ID: {order.customer.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
                    </div>
                    <div className="pt-2">
                      {order.customer.id !== 'Guest' && (
                        <Link to={`/admin/customers/${order.customer.id}`}>
                          <Button
                            variant="outline"
                            className="w-full hover:bg-primary/10"
                            aria-label="View customer profile"
                          >
                            View Customer Profile
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-heading text-secondary">Shipping</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Delivery information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-secondary">Shipping Address</div>
                        <div className="text-sm text-muted-foreground">
                          {order.shipping_address.street}
                          <br />
                          {order.shipping_address.city}, {order.shipping_address.state}
                          <br />
                          {order.shipping_address.postal_code}
                          <br />
                          {order.shipping_address.country}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Truck className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-secondary">Shipping Method</div>
                        <div className="text-sm text-muted-foreground">{order.shipping_method}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="border-primary/20 bg-background shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-heading text-secondary">Payment</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Transaction details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CreditCard className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-secondary">Payment Method</div>
                        <div className="text-sm text-muted-foreground">{order.payment_method}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FileText className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-secondary">Transaction ID</div>
                        <div className="text-sm text-muted-foreground">{order.payment_id}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-5 mr-2"></div>
                      <div>
                        <div className="font-medium text-secondary">Payment Status</div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusStyles[order.payment_status]}`}
                          >
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isRefundDialogOpen && (
            <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
              <motion.div
                variants={dialogVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <DialogContent className="rounded-lg bg-background">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-heading text-secondary">Process Refund</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="refundAmount"
                        className="block text-sm font-medium text-secondary mb-1.5"
                      >
                        Refund Amount
                      </label>
                      <Input
                        id="refundAmount"
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder="Enter refund amount"
                        min="0"
                        max={order.total}
                        aria-label="Refund amount"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="refundReason"
                        className="block text-sm font-medium text-secondary mb-1.5"
                      >
                        Refund Reason
                      </label>
                      <Textarea
                        id="refundReason"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Enter reason for refund"
                        rows={3}
                        className="resize-none"
                        aria-label="Refund reason"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsRefundDialogOpen(false)}
                      className="hover:bg-muted/50"
                      aria-label="Cancel refund"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRefund}
                      disabled={!refundAmount || !refundReason || loading}
                      className="bg-primary hover:bg-primary-dark text-secondary"
                      aria-label="Process refund"
                    >
                      Process Refund
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCancelDialogOpen && (
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
              <motion.div
                variants={dialogVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <DialogContent className="rounded-lg bg-background">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-heading text-secondary">Cancel Order</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to cancel order {order.orderNumber}? This action cannot be undone.
                  </p>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCancelDialogOpen(false)}
                      className="hover:bg-muted/50"
                      aria-label="Keep order"
                    >
                      No, Keep Order
                    </Button>
                    <Button
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                      onClick={handleCancelOrder}
                      disabled={loading}
                      aria-label="Confirm cancel order"
                    >
                      Yes, Cancel Order
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default OrderDetailPage;