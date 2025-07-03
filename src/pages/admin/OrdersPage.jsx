import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Download
} from 'lucide-react';

// Sample data for demonstration
const orders = [
  { 
    id: 'ORD-001', 
    customer: 'John Doe', 
    email: 'john.doe@example.com',
    date: '2023-05-15', 
    total: 12500, 
    status: 'Delivered',
    payment_status: 'Paid',
    payment_method: 'Credit Card',
    items: 2
  },
  { 
    id: 'ORD-002', 
    customer: 'Jane Smith', 
    email: 'jane.smith@example.com',
    date: '2023-05-14', 
    total: 8700, 
    status: 'Processing',
    payment_status: 'Paid',
    payment_method: 'PayPal',
    items: 1
  },
  { 
    id: 'ORD-003', 
    customer: 'Robert Johnson', 
    email: 'robert.j@example.com',
    date: '2023-05-14', 
    total: 5300, 
    status: 'Pending',
    payment_status: 'Pending',
    payment_method: 'Bank Transfer',
    items: 1
  },
  { 
    id: 'ORD-004', 
    customer: 'Emily Davis', 
    email: 'emily.davis@example.com',
    date: '2023-05-13', 
    total: 15000, 
    status: 'Shipped',
    payment_status: 'Paid',
    payment_method: 'Credit Card',
    items: 3
  },
  { 
    id: 'ORD-005', 
    customer: 'Michael Brown', 
    email: 'michael.b@example.com',
    date: '2023-05-12', 
    total: 3200, 
    status: 'Delivered',
    payment_status: 'Paid',
    payment_method: 'PayPal',
    items: 1
  },
  { 
    id: 'ORD-006', 
    customer: 'Sarah Wilson', 
    email: 'sarah.w@example.com',
    date: '2023-05-11', 
    total: 9800, 
    status: 'Cancelled',
    payment_status: 'Refunded',
    payment_method: 'Credit Card',
    items: 2
  },
  { 
    id: 'ORD-007', 
    customer: 'David Miller', 
    email: 'david.m@example.com',
    date: '2023-05-10', 
    total: 7500, 
    status: 'Delivered',
    payment_status: 'Paid',
    payment_method: 'PayPal',
    items: 1
  },
  { 
    id: 'ORD-008', 
    customer: 'Lisa Taylor', 
    email: 'lisa.t@example.com',
    date: '2023-05-09', 
    total: 22000, 
    status: 'Delivered',
    payment_status: 'Paid',
    payment_method: 'Credit Card',
    items: 4
  },
];

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter orders based on search term, status, and payment status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus ? order.status === selectedStatus : true;
    const matchesPaymentStatus = selectedPaymentStatus ? order.payment_status === selectedPaymentStatus : true;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
          <div className="mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center">
              <Download size={16} className="mr-2" />
              Export Orders
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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  >
                    <option value="">All Payment Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
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
                  {currentItems.length > 0 ? (
                    currentItems.map((order) => (
                      <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 pl-0 font-medium">{order.id}</td>
                        <td className="p-3">
                          <div>{order.customer}</div>
                          <div className="text-xs text-slate-500">{order.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1 text-slate-400" />
                            {order.date}
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
                        No orders found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-md ${currentPage === page ? 'bg-primary text-secondary' : 'border border-slate-200'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
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