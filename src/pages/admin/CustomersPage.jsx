import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, UserPlus, Filter, ChevronLeft, ChevronRight, User, Mail, Phone, Calendar, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';
import CustomerService from '../../services/admin/customer.service';
import { LoadingOverlay, LoadingState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';

const CustomersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialStatus = queryParams.get('status') || 'all';
  const initialSearch = queryParams.get('search') || '';

  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [customersPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (searchTerm) params.set('search', searchTerm);

    const newUrl = `${location.pathname}?${params.toString()}`;
    navigate(newUrl, { replace: true });
  }, [currentPage, statusFilter, searchTerm, navigate, location.pathname]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: customersPerPage,
        search: searchTerm,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await CustomerService.getCustomers(params);
      console.log(response)
      setCustomers(response.data);
      setTotalCustomers(response.data.length);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || 'Failed to load customers');
      setLoading(false);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, statusFilter, searchTerm, customersPerPage]);

  const totalPages = Math.ceil(totalCustomers / customersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
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
                defaultValue={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button variant="outline" className="flex items-center" onClick={fetchCustomers} disabled={loading}>
                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Link to="/admin/customers/add">
                <Button variant="default" className="flex items-center">
                  <UserPlus size={16} className="mr-2" />
                  Add Customer
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {loading && !error && <LoadingState fullPage={false} className="py-12" />}

        {error && (
          <ErrorState
            title="Failed to load customers"
            message={error}
            onRetry={fetchCustomers}
            className="py-12"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>{totalCustomers} customers found</CardDescription>
          </CardHeader>
          <CardContent>
            <LoadingOverlay loading={loading && !error}>
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
                    {customers.length > 0 ? (
                      customers.map((customer) => (
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
                                <span>{customer.phone || 'N/A'}</span>
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
                                <span>Last: {customer.last_order_date || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{formatCurrency(customer.total_spent)}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                              }`}
                            >
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
                        <td colSpan="6" className="p-3 text-center text-slate-500">
                          {error ? (
                            <div className="flex items-center justify-center">
                              <AlertCircle size={16} className="mr-2 text-red-500" />
                              {error}
                            </div>
                          ) : loading ? (
                            'Loading customers...'
                          ) : (
                            'No customers found matching your criteria'
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </LoadingOverlay>

            {totalCustomers > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * customersPerPage + 1} to{' '}
                  {Math.min(currentPage * customersPerPage, totalCustomers)} of {totalCustomers} customers
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
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                    <>
                      <Button
                        variant={currentPage === 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={loading}
                      >
                        1
                      </Button>
                      {currentPage > 3 && <span className="px-2">...</span>}
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum;
                        if (currentPage <= 2) {
                          pageNum = i + 2;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 3 + i;
                        } else {
                          pageNum = currentPage - 1 + i;
                        }
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
                      }).filter(Boolean)}
                      {currentPage < totalPages - 2 && <span className="px-2">...</span>}
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

export default CustomersPage;