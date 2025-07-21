import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  RefreshCw,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import CustomerService from '../../services/admin/customer.service';
import { formatPrice } from '../../lib/utils';
import debounce from 'lodash/debounce';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CustomersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
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

  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (searchTerm) params.set('search', searchTerm);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [currentPage, statusFilter, searchTerm, navigate, location.pathname]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: customersPerPage, search: searchTerm };
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await CustomerService.getCustomers(params);
      setCustomers(response.data);
      setTotalCustomers(response.total || response.data.length);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
      addToast(err.response?.data?.message || 'Failed to load customers', 'error');
      setLoading(false);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, statusFilter, searchTerm]);

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

  const getPaginationRange = () => {
    const maxPagesToShow = 5;
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return { startPage, endPage, pages };
  };

  const { startPage, endPage, pages } = getPaginationRange();

  if (loading && !customers.length) {
    return (
      <LoadingOverlay loading={loading}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto py-12 px-4 sm:px-6"
        >
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading customers...</p>
          </div>
        </motion.div>
      </LoadingOverlay>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customers | Scenture Admin</title>
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
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
              Customers
            </h1>
            <p className="text-sm text-muted-foreground">Manage your customer base</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                defaultValue={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search customers..."
                className="pl-10 w-full lg:w-64"
                aria-label="Search customers"
              />
            </div>
            <div className="flex max-md:flex-col gap-3">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full lg:w-40" aria-label="Filter by status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCustomers}
                disabled={loading}
                className="hover:bg-primary/10"
                aria-label="Refresh customer list"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link to="/admin/customers/add">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary-dark text-secondary w-full lg:w-auto"
                  aria-label="Add new customer"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </Link>
            </div>
          </div>
        </motion.header>

        {error && (
          <motion.div variants={cardVariants}>
            <ErrorState
              title="Failed to load customers"
              message={error}
              onRetry={fetchCustomers}
              className="py-12 px-4 sm:px-6"
            />
          </motion.div>
        )}

        <motion.div variants={cardVariants}>
          <Card className="border-primary/20 bg-background shadow-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg font-heading text-secondary">Customer List</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {totalCustomers} customers found
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <LoadingOverlay loading={loading && customers.length > 0}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <motion.div
                          key={customer.id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <Card className="border-primary/20 bg-background hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-4">
                              <div className="flex flex-col space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-secondary">{customer.name}</div>
                                      <div className="text-xs text-muted-foreground">{customer.id}</div>
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      customer.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                  </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center">
                                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">{customer.email}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{customer.phone || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{customer.total_orders} orders</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Last: {customer.last_order_date || 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-sm text-primary">
                                    {formatPrice(customer.total_spent)}
                                  </div>
                                  <Link to={`/admin/customers/${customer.id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="hover:bg-primary/10"
                                      aria-label={`View ${customer.name}'s details`}
                                    >
                                      View
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center p-4"
                      >
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="mt-2 text-muted-foreground">
                          {error ? error : 'No customers found matching your criteria'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {totalCustomers > customersPerPage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4"
                  >
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * customersPerPage + 1} to{' '}
                      {Math.min(currentPage * customersPerPage, totalCustomers)} of {totalCustomers} customers
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="hover:bg-primary/10"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {startPage > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            disabled={loading}
                            className="hover:bg-primary/10"
                          >
                            1
                          </Button>
                          {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
                        </>
                      )}
                      {pages.map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={
                            currentPage === page
                              ? 'bg-primary hover:bg-primary-dark text-secondary'
                              : 'hover:bg-primary/10'
                          }
                          aria-label={`Page ${page}`}
                        >
                          {page}
                        </Button>
                      ))}
                      {endPage < totalPages && (
                        <>
                          {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={loading}
                            className="hover:bg-primary/10"
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
                        className="hover:bg-primary/10"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </LoadingOverlay>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CustomersPage;