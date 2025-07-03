import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
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
  Send
} from 'lucide-react';

// Sample order data for demonstration
const sampleOrder = {
  id: 'ORD-001',
  date: '2023-05-15',
  status: 'Processing',
  payment_status: 'Paid',
  payment_method: 'Credit Card',
  payment_id: 'PAY-12345678',
  total: 12500,
  subtotal: 11000,
  shipping: 1500,
  tax: 0,
  customer: {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+234 812 345 6789',
  },
  shipping_address: {
    street: '123 Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postal_code: '101233',
  },
  billing_address: {
    street: '123 Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postal_code: '101233',
  },
  items: [
    {
      id: 1,
      product_id: 'PROD-001',
      name: 'Lavender Dreams Candle',
      variant: '8oz',
      price: 5500,
      quantity: 1,
      subtotal: 5500,
    },
    {
      id: 2,
      product_id: 'PROD-002',
      name: 'Vanilla Bliss Room Spray',
      variant: 'Standard',
      price: 5500,
      quantity: 1,
      subtotal: 5500,
    },
  ],
  timeline: [
    {
      id: 1,
      date: '2023-05-15 14:30:00',
      status: 'Order Placed',
      description: 'Order was placed by customer',
    },
    {
      id: 2,
      date: '2023-05-15 14:35:00',
      status: 'Payment Confirmed',
      description: 'Payment was confirmed via Credit Card',
    },
    {
      id: 3,
      date: '2023-05-16 09:15:00',
      status: 'Processing',
      description: 'Order is being processed',
    },
  ],
  notes: [
    {
      id: 1,
      date: '2023-05-16 10:00:00',
      author: 'Admin',
      content: 'Customer requested gift wrapping for this order.',
    },
  ],
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [note, setNote] = useState('');
  
  useEffect(() => {
    // In a real app, you would fetch the order data from an API
    // For now, we'll use the sample data
    setOrder(sampleOrder);
    setStatusUpdate(sampleOrder.status);
    setLoading(false);
  }, [id]);

  const handleStatusUpdate = () => {
    // In a real app, you would update the order status via an API
    if (statusUpdate && statusUpdate !== order.status) {
      setOrder(prev => ({
        ...prev,
        status: statusUpdate,
        timeline: [
          ...prev.timeline,
          {
            id: prev.timeline.length + 1,
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: statusUpdate,
            description: `Order status updated to ${statusUpdate}`,
          },
        ],
      }));
    }
  };

  const handleAddNote = () => {
    // In a real app, you would add the note via an API
    if (note.trim()) {
      setOrder(prev => ({
        ...prev,
        notes: [
          ...prev.notes,
          {
            id: prev.notes.length + 1,
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            author: 'Admin',
            content: note.trim(),
          },
        ],
      }));
      setNote('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-heading font-medium text-secondary mb-2">Order Not Found</h2>
        <p className="text-secondary/70 mb-6">The order you are looking for does not exist or has been removed.</p>
        <Link to="/admin/orders">
          <Button variant="default">
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
                <span>{order.date}</span>
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
            <Button variant="outline" className="flex items-center">
              <Printer size={16} className="mr-2" />
              Print Invoice
            </Button>
            <Button variant="default" className="flex items-center">
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
                          <span className="text-xs text-slate-500">{event.date}</span>
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
                          <span className="font-medium text-secondary">{noteItem.author}</span>
                          <span className="text-xs text-slate-500">{noteItem.date}</span>
                        </div>
                        <p className="text-sm text-slate-600">{noteItem.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-4">No notes added yet</p>
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
                    disabled={!note.trim()}
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
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <Button 
                      onClick={handleStatusUpdate} 
                      disabled={statusUpdate === order.status}
                      className="rounded-l-none"
                    >
                      Update
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 hover:border-red-200">
                    Cancel Order
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
                    <div className="text-sm">{order.customer.phone}</div>
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
                      <div className="text-sm text-slate-600">Standard Delivery</div>
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
                      <div className="text-sm text-slate-600">{order.payment_method}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div>
                      <div className="font-medium">Transaction ID</div>
                      <div className="text-sm text-slate-600">{order.payment_id}</div>
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
      </div>
    </>
  );
};

export default OrderDetailPage;