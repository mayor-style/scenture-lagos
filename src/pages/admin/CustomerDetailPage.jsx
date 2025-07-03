import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
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
  XCircle
} from 'lucide-react';

// Sample customer data for demonstration
const sampleCustomer = {
  id: 'CUST-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+234 812 345 6789',
  created_at: '2023-01-15',
  status: 'active',
  total_orders: 5,
  total_spent: 75000,
  address: {
    street: '123 Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postal_code: '101233',
  },
  orders: [
    {
      id: 'ORD-001',
      date: '2023-05-10',
      status: 'Delivered',
      total: 15000,
      items: 2,
    },
    {
      id: 'ORD-002',
      date: '2023-04-22',
      status: 'Delivered',
      total: 18500,
      items: 3,
    },
    {
      id: 'ORD-003',
      date: '2023-03-15',
      status: 'Delivered',
      total: 12500,
      items: 1,
    },
    {
      id: 'ORD-004',
      date: '2023-02-28',
      status: 'Delivered',
      total: 22000,
      items: 2,
    },
    {
      id: 'ORD-005',
      date: '2023-01-17',
      status: 'Delivered',
      total: 7000,
      items: 1,
    },
  ],
  reviews: [
    {
      id: 'REV-001',
      product_name: 'Lavender Dreams Candle',
      product_id: 'PROD-001',
      rating: 5,
      date: '2023-05-12',
      content: 'Absolutely love this candle! The scent is perfect - not too strong but fills the room beautifully. Will definitely purchase again.',
    },
    {
      id: 'REV-002',
      product_name: 'Vanilla Bliss Room Spray',
      product_id: 'PROD-002',
      rating: 4,
      date: '2023-04-25',
      content: 'Great room spray with a lovely scent. Lasts for a good amount of time. Would recommend.',
    },
  ],
  notes: [
    {
      id: 1,
      date: '2023-05-16',
      author: 'Admin',
      content: 'Customer called to inquire about upcoming product launches. Very interested in new summer collection.',
    },
  ],
};

const CustomerDetailPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'reviews', 'notes'
  
  useEffect(() => {
    // In a real app, you would fetch the customer data from an API
    // For now, we'll use the sample data
    setCustomer(sampleCustomer);
    setLoading(false);
  }, [id]);

  const handleAddNote = () => {
    // In a real app, you would add the note via an API
    if (note.trim()) {
      setCustomer(prev => ({
        ...prev,
        notes: [
          {
            id: prev.notes.length + 1,
            date: new Date().toISOString().split('T')[0],
            author: 'Admin',
            content: note.trim(),
          },
          ...prev.notes,
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
          <p className="mt-4 text-secondary">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-heading font-medium text-secondary mb-2">Customer Not Found</h2>
        <p className="text-secondary/70 mb-6">The customer you are looking for does not exist or has been removed.</p>
        <Link to="/admin/customers">
          <Button variant="default">
            <ArrowLeft size={16} className="mr-2" />
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{customer.name} | Scenture Lagos Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <Link to="/admin/customers" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-medium text-secondary">
                {customer.name}
              </h1>
              <div className="flex items-center mt-1 text-secondary/70">
                <span>{customer.id}</span>
                <span className="mx-2">•</span>
                <Calendar size={14} className="mr-1" />
                <span>Customer since {customer.created_at}</span>
                <span className="mx-2">•</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {customer.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="default" className="flex items-center">
              <Edit size={16} className="mr-2" />
              Edit Customer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Card>
              <div className="border-b border-slate-200">
                <div className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : 'text-slate-600'}`}
                  >
                    Orders ({customer.orders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-slate-600'}`}
                  >
                    Reviews ({customer.reviews.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'notes' ? 'border-b-2 border-primary text-primary' : 'text-slate-600'}`}
                  >
                    Notes ({customer.notes.length})
                  </button>
                </div>
              </div>
              <CardContent className="p-0">
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left font-medium p-4 pl-6">Order ID</th>
                          <th className="text-left font-medium p-4">Date</th>
                          <th className="text-left font-medium p-4">Status</th>
                          <th className="text-left font-medium p-4">Items</th>
                          <th className="text-right font-medium p-4">Total</th>
                          <th className="text-right font-medium p-4 pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.orders.map((order) => (
                          <tr key={order.id} className="border-b border-slate-100">
                            <td className="p-4 pl-6 font-medium">{order.id}</td>
                            <td className="p-4">{order.date}</td>
                            <td className="p-4">
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
                            <td className="p-4">{order.items} item{order.items !== 1 ? 's' : ''}</td>
                            <td className="p-4 text-right font-medium">{formatPrice(order.total)}</td>
                            <td className="p-4 pr-6 text-right">
                              <Link to={`/admin/orders/${order.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="divide-y divide-slate-100">
                    {customer.reviews.length > 0 ? (
                      customer.reviews.map((review) => (
                        <div key={review.id} className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Link to={`/admin/products/${review.product_id}`} className="font-medium text-secondary hover:text-primary">
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
                            </div>
                            <Link to={`/admin/products/${review.product_id}/reviews`}>
                              <Button variant="outline" size="sm">
                                View Product
                              </Button>
                            </Link>
                          </div>
                          <p className="text-slate-600">{review.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-500">
                        No reviews yet
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="p-6 space-y-6">
                    <div className="space-y-3">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note about this customer..."
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
                    
                    <div className="space-y-4">
                      {customer.notes.length > 0 ? (
                        customer.notes.map((noteItem) => (
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Contact details and address</CardDescription>
              </CardHeader>
              <CardContent>
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
                    <div className="text-sm">{customer.email}</div>
                  </div>
                  <div className="flex items-start">
                    <Phone size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div className="text-sm">{customer.phone}</div>
                  </div>
                  <div className="flex items-start">
                    <MapPin size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <div className="text-sm">
                      {customer.address.street}<br />
                      {customer.address.city}, {customer.address.state}<br />
                      {customer.address.postal_code}<br />
                      {customer.address.country}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Stats</CardTitle>
                <CardDescription>Overview of customer activity</CardDescription>
              </CardHeader>
              <CardContent>
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
                    <span className="font-medium">{customer.orders[0]?.date || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star size={16} className="mr-2 text-slate-400" />
                      <span>Reviews</span>
                    </div>
                    <span className="font-medium">{customer.reviews.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-slate-400" />
                      <span>Customer Since</span>
                    </div>
                    <span className="font-medium">{customer.created_at}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between font-medium text-lg">
                      <span>Total Spent</span>
                      <span className="text-primary">{formatPrice(customer.total_spent)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle size={16} className="mr-2 text-green-600" />
                  Mark as VIP
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle size={16} className="mr-2 text-yellow-600" />
                  Flag for Review
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 hover:border-red-200">
                  <XCircle size={16} className="mr-2" />
                  Deactivate Account
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