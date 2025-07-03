import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, UserPlus, Filter, ChevronLeft, ChevronRight, User, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';

// Sample customer data for demonstration
const sampleCustomers = [
  {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+234 812 345 6789',
    created_at: '2023-01-15',
    total_orders: 5,
    total_spent: 75000,
    last_order_date: '2023-05-10',
    status: 'active',
  },
  {
    id: 'CUST-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+234 803 456 7890',
    created_at: '2023-02-20',
    total_orders: 3,
    total_spent: 45000,
    last_order_date: '2023-04-25',
    status: 'active',
  },
  {
    id: 'CUST-003',
    name: 'Michael Adebayo',
    email: 'michael.a@example.com',
    phone: '+234 705 678 9012',
    created_at: '2023-03-05',
    total_orders: 1,
    total_spent: 12500,
    last_order_date: '2023-03-05',
    status: 'active',
  },
  {
    id: 'CUST-004',
    name: 'Chioma Okafor',
    email: 'chioma.o@example.com',
    phone: '+234 908 765 4321',
    created_at: '2023-03-12',
    total_orders: 2,
    total_spent: 28000,
    last_order_date: '2023-05-01',
    status: 'active',
  },
  {
    id: 'CUST-005',
    name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '+234 814 567 8901',
    created_at: '2023-04-18',
    total_orders: 1,
    total_spent: 15000,
    last_order_date: '2023-04-18',
    status: 'inactive',
  },
  {
    id: 'CUST-006',
    name: 'Amina Ibrahim',
    email: 'amina.i@example.com',
    phone: '+234 706 789 0123',
    created_at: '2023-04-30',
    total_orders: 4,
    total_spent: 62000,
    last_order_date: '2023-05-15',
    status: 'active',
  },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;

  // Filter customers based on search term and status filter
  const filteredCustomers = sampleCustomers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Helmet>
        <title>Customers | Scenture Lagos Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-medium text-secondary">Customers</h1>
            <p className="text-secondary/70 mt-1">Manage your customer base</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <Button variant="default" className="flex items-center">
                <UserPlus size={16} className="mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              {filteredCustomers.length} customers found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-medium p-3 pl-0">Customer</th>
                    <th className="text-left font-medium p-3">Contact</th>
                    <th className="text-left font-medium p-3">Orders</th>
                    <th className="text-left font-medium p-3">Total Spent</th>
                    <th className="text-left font-medium p-3">Status</th>
                    <th className="text-right font-medium p-3 pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.length > 0 ? (
                    currentCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-slate-100">
                        <td className="p-3 pl-0">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <User size={16} className="text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-secondary">{customer.name}</div>
                              <div className="text-xs text-slate-500">{customer.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Mail size={14} className="mr-1 text-slate-400" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Phone size={14} className="mr-1 text-slate-400" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <ShoppingBag size={14} className="mr-1 text-slate-400" />
                              <span>{customer.total_orders} orders</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Calendar size={14} className="mr-1 text-slate-400" />
                              <span>Last: {customer.last_order_date}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{formatCurrency(customer.total_spent)}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {customer.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 pr-0 text-right">
                          <Link to={`/admin/customers/${customer.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-slate-500">
                        No customers found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredCustomers.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-500">
                  Showing {indexOfFirstCustomer + 1} to {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length} customers
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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

export default CustomersPage;