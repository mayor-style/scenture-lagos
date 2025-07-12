// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice, formatDate } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Clock, Plus, RefreshCw, Calendar, Loader2, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardService from '../../services/admin/dashboard.service';
import { LoadingOverlay, EmptyState } from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { useRefresh } from '../../contexts/RefreshContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { needsRefresh, setNeedsRefresh } = useRefresh();

  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    inventoryValue: 0,
    newCustomers: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    lowStockProducts: 0,
    lastUpdated: '',
  });
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesPeriod, setSalesPeriod] = useState('week');
  const [activityFilter, setActivityFilter] = useState('all');

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      const response = await DashboardService.getDashboardSummary();
      setSummary({
        totalSales: response.data.metrics.totalSales,
        totalOrders: response.data.metrics.totalOrders,
        inventoryValue: response.data.metrics.inventoryValue,
        newCustomers: response.data.metrics.newCustomers,
        salesGrowth: response.data.metrics.salesGrowth,
        ordersGrowth: response.data.metrics.ordersGrowth,
        customersGrowth: response.data.metrics.customersGrowth,
        lowStockProducts: response.data.metrics.lowStockProducts,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      setError('Failed to fetch summary data');
      addToast('Failed to load dashboard summary', 'error');
    }
    setLoading(false);
  };

  const fetchSalesData = async (period = 'week', startDate, endDate) => {
    setSalesLoading(true);
    try {
      const response = await DashboardService.getSalesData({ period, startDate, endDate });
      setSalesData(response.data);
    } catch (err) {
      setSalesData([]);
      addToast('Failed to load sales data', 'error');
    }
    setSalesLoading(false);
  };

  const fetchRecentOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await DashboardService.getRecentOrders({ limit: 5 });
      const formattedOrders = response.data.orders.map((order) => ({
        id: order.orderNumber,
        customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
        date: order.createdAt,
        total: order.totalAmount,
        status: order.status,
      }));
      setRecentOrders(formattedOrders);
    } catch (err) {
      setRecentOrders([]);
      addToast('Failed to load recent orders', 'error');
    }
    setOrdersLoading(false);
  };

  const fetchActivityFeed = async () => {
    setActivityLoading(true);
    try {
      const response = await DashboardService.getActivityFeed({ limit: 10, type: activityFilter });
      setActivityFeed(response.data.activities);
    } catch (err) {
      setActivityFeed([]);
      addToast('Failed to load activity feed', 'error');
    }
    setActivityLoading(false);
  };

  const fetchDashboardData = async () => {
    setError(null);
    DashboardService.clearCache(); // Clear cache for fresh data
    await Promise.all([
      fetchSummaryData(),
      fetchSalesData(salesPeriod, new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], new Date().toISOString().split('T')[0]),
      fetchRecentOrders(),
      fetchActivityFeed(),
    ]);
    addToast('Dashboard data refreshed', 'success');
  };

  const handlePeriodChange = (period) => {
    setSalesPeriod(period);
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    fetchSalesData(period, formattedStartDate, formattedEndDate);
  };

  const getActivityCounts = (activities) => {
    if (!Array.isArray(activities) || activities.length === 0) {
      return { product: 0, order: 0, inventory: 0, customer: 0, general: 0 };
    }
    return activities.reduce((counts, activity) => {
      const type = activity.type || 'general';
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, { product: 0, order: 0, inventory: 0, customer: 0, general: 0 });
  };

  useEffect(() => {
    const checkCache = async () => {
      const summaryCached = DashboardService.getCachedData(`summary_${JSON.stringify({})}`);
      const ordersCached = DashboardService.getCachedData(`recent-orders_${JSON.stringify({ limit: 5 })}`);
      const salesCached = DashboardService.getCachedData(`sales-data_${JSON.stringify({ period: salesPeriod })}`);
      const activityCached = DashboardService.getCachedData(`activity-feed_${JSON.stringify({ limit: 10, type: activityFilter })}`);

      if (
        needsRefresh ||
        !summaryCached ||
        !ordersCached ||
        !salesCached ||
        !activityCached
      ) {
        fetchDashboardData();
        setNeedsRefresh(false);
      } else {
        setSummary(summaryCached.metrics);
        setRecentOrders(ordersCached.orders.map((order) => ({
          id: order.orderNumber,
          customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
          date: order.createdAt,
          total: order.totalAmount,
          status: order.status,
        })));
        setSalesData(salesCached);
        setActivityFeed(activityCached.activities);
        setLoading(false);
        setOrdersLoading(false);
        setSalesLoading(false);
        setActivityLoading(false);
      }
    };
    checkCache();
  }, [salesPeriod, activityFilter, needsRefresh]);

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  return (
    <>
      <Helmet>
        <title>Dashboard | Scenture Lagos Admin</title>
      </Helmet>
      <div className="space-y-8 px-0">
        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="dashboardHeading">Dashboard</h1>
            <p className="dashboardSubHeading">Welcome back to your admin dashboard</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              variant="outline"
              className="flex items-center justify-center h-11 px-6 border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-200 backdrop-blur-sm"
              onClick={fetchDashboardData}
              disabled={loading || salesLoading || ordersLoading || activityLoading}
            >
              {loading || salesLoading || ordersLoading || activityLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  <span className="text-sm font-medium">Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  <span className="text-sm font-medium">Refresh</span>
                </>
              )}
            </Button>
            <Button
              variant="default"
              className="flex items-center justify-center h-11 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
              onClick={() => navigate('/admin/products/new')}
            >
              <Plus size={16} className="mr-2" />
              <span className="text-sm font-medium">New Product</span>
            </Button>
            <Button
              variant="outline"
              className={`flex items-center justify-center h-11 px-6 ${
                isPolling ? 'bg-green-100 text-green-700' : 'border-secondary/20 hover:border-secondary/40'
              } transition-all duration-200`}
              onClick={() => {
                if (isPolling) {
                  clearInterval(pollingInterval);
                  setPollingInterval(null);
                  setIsPolling(false);
                  addToast('Real-time updates disabled', 'success');
                } else {
                  const interval = setInterval(fetchDashboardData, 60000);
                  setPollingInterval(interval);
                  setIsPolling(true);
                  addToast('Real-time updates enabled', 'success');
                }
              }}
              disabled={loading || salesLoading || ordersLoading || activityLoading}
            >
              {isPolling ? (
                <>
                  <Clock size={16} className="mr-2 animate-pulse" />
                  <span className="text-sm font-medium">Stop Real-Time</span>
                </>
              ) : (
                <>
                  <Clock size={16} className="mr-2" />
                  <span className="text-sm font-medium">Start Real-Time</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6">
            <ErrorState
              title="Failed to load dashboard data"
              message={error}
              onRetry={() => fetchDashboardData()}
              className="py-0"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <Card className="group hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 border-0 bg-gradient-to-br from-white to-red-50/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-6 sm:p-8">
              <LoadingOverlay loading={loading}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-secondary/60 tracking-wide uppercase">Low Stock Alerts</p>
                    <h3 className="text-2xl sm:text-3xl font-heading font-light text-secondary">{summary.lowStockProducts}</h3>
                    <p className="text-xs text-secondary/60 flex items-center">
                      <Package size={14} className="mr-1.5" />
                      Products below threshold
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-200"
                      onClick={() => navigate('/admin/inventory?filter=low-stock')}
                    >
                      View Low Stock
                    </Button>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Package size={24} className="text-red-600" />
                  </div>
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-6 sm:p-8">
              <LoadingOverlay loading={loading}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-secondary/60 tracking-wide uppercase">Total Sales</p>
                    <h3 className="text-2xl sm:text-3xl font-heading font-light text-secondary">{formatPrice(summary.totalSales)}</h3>
                    <p className={`text-xs flex items-center ${summary.salesGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      <TrendingUp size={14} className="mr-1.5" />
                      {summary.salesGrowth >= 0 ? '+' : ''}{summary.salesGrowth}% from last period
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <DollarSign size={24} className="text-primary" />
                  </div>
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-6 sm:p-8">
              <LoadingOverlay loading={loading}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-secondary/60 tracking-wide uppercase">Total Orders</p>
                    <h3 className="text-2xl sm:text-3xl font-heading font-light text-secondary">{summary.totalOrders}</h3>
                    <p className={`text-xs flex items-center ${summary.ordersGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      <TrendingUp size={14} className="mr-1.5" />
                      {summary.ordersGrowth >= 0 ? '+' : ''}{summary.ordersGrowth}% from last period
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <ShoppingCart size={24} className="text-blue-600" />
                  </div>
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-6 sm:p-8">
              <LoadingOverlay loading={loading}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-secondary/60 tracking-wide uppercase">Inventory Value</p>
                    <h3 className="text-2xl sm:text-3xl font-heading font-light text-secondary">{formatPrice(summary.inventoryValue)}</h3>
                    <p className="text-xs text-secondary/60 flex items-center">
                      <Clock size={14} className="mr-1.5" />
                      {summary.lastUpdated ? `Updated ${formatDate(summary.lastUpdated, { format: 'short' })}` : 'Recently updated'}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Package size={24} className="text-purple-600" />
                  </div>
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-6 sm:p-8">
              <LoadingOverlay loading={loading}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-secondary/60 tracking-wide uppercase">New Customers</p>
                    <h3 className="text-2xl sm:text-3xl font-heading font-light text-secondary">{summary.newCustomers}</h3>
                    <p className={`text-xs flex items-center ${summary.customersGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      <TrendingUp size={14} className="mr-1.5" />
                      {summary.customersGrowth >= 0 ? '+' : ''}{summary.customersGrowth}% from last period
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Users size={24} className="text-emerald-600" />
                  </div>
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <Card className="col-span-1 lg:col-span-2 border-0 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-heading font-medium text-secondary">Sales Overview</CardTitle>
                  <CardDescription className="text-secondary/60">{salesLoading ? 'Loading...' : 'Sales performance over time'}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${salesPeriod === 'week' ? 'bg-primary text-white border-primary' : 'border-secondary/20 hover:border-secondary/40'} transition-all duration-200`}
                    onClick={() => handlePeriodChange('week')}
                    disabled={salesLoading}
                  >
                    Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${salesPeriod === 'month' ? 'bg-primary text-white border-primary' : 'border-secondary/20 hover:border-secondary/40'} transition-all duration-200`}
                    onClick={() => handlePeriodChange('month')}
                    disabled={salesLoading}
                  >
                    Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${salesPeriod === 'year' ? 'bg-primary text-white border-primary' : 'border-secondary/20 hover:border-secondary/40'} transition-all duration-200`}
                    onClick={() => handlePeriodChange('year')}
                    disabled={salesLoading}
                  >
                    Year
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LoadingOverlay loading={salesLoading}>
                <div className="h-80">
                  {salesData && salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(10px)',
                          }}
                        />
                        <Bar dataKey="sales" fill="url(#salesGradient)" radius={[8, 8, 0, 0]} />
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E5D3C8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#E5D3C8" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <EmptyState
                        icon={<Calendar className="h-12 w-12 text-secondary/30" />}
                        title="No sales data available"
                        description="There is no sales data for the selected period."
                      />
                    </div>
                  )}
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-heading font-medium text-secondary">Quick Actions</CardTitle>
              <CardDescription className="text-secondary/60">Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="default"
                  className="w-full justify-start h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => navigate('/admin/products/new')}
                >
                  <Plus size={18} className="mr-3" />
                  <span className="font-medium">Add New Product</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-200"
                  onClick={() => navigate('/admin/orders?status=pending')}
                >
                  <ShoppingCart size={18} className="mr-3" />
                  <span className="font-medium">View Pending Orders</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-200"
                  onClick={() => navigate('/admin/inventory')}
                >
                  <Package size={18} className="mr-3" />
                  <span className="font-medium">Update Inventory</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-200"
                  onClick={() => navigate('/admin/customers')}
                >
                  <Users size={18} className="mr-3" />
                  <span className="font-medium">View Customer List</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <Card className="lg:col-span-2 border-0 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-heading font-medium text-secondary">Recent Orders</CardTitle>
                <CardDescription className="text-secondary/60">{ordersLoading ? 'Loading...' : 'Latest customer orders'}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-200"
                onClick={() => navigate('/admin/orders')}
                disabled={ordersLoading}
              >
                <span className="font-medium">View All</span>
              </Button>
            </CardHeader>
            <CardContent>
              <LoadingOverlay loading={ordersLoading}>
                <div className="overflow-x-auto">
                  {recentOrders && recentOrders.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200/60">
                          <th className="text-left font-semibold text-secondary/80 p-4 pl-0 tracking-wide">Order ID</th>
                          <th className="text-left font-semibold text-secondary/80 p-4 tracking-wide">Customer</th>
                          <th className="text-left font-semibold text-secondary/80 p-4 tracking-wide hidden sm:table-cell">Date</th>
                          <th className="text-left font-semibold text-secondary/80 p-4 tracking-wide">Amount</th>
                          <th className="text-left font-semibold text-secondary/80 p-4 tracking-wide">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-slate-100/60 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent cursor-pointer transition-all duration-200"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          >
                            <td className="p-4 pl-0 font-medium text-secondary">{order.id}</td>
                            <td className="p-4 text-secondary/80">{order.customer}</td>
                            <td className="p-4 text-secondary/70 hidden sm:table-cell">{formatDate(order.date, { format: 'short' })}</td>
                            <td className="p-4 font-semibold text-secondary">{formatPrice(order.total)}</td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : order.status === 'Processing'
                                    ? 'bg-blue-100 text-blue-700'
                                    : order.status === 'Pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-12 flex items-center justify-center">
                      <EmptyState
                        icon={<ShoppingCart className="h-12 w-12 text-secondary/30" />}
                        title="No recent orders"
                        description="There are no recent orders to display."
                      />
                    </div>
                  )}
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-heading font-medium text-secondary">Activity Feed</CardTitle>
                <CardDescription className="text-secondary/60">{activityLoading ? 'Loading...' : 'Recent system activities'}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary/5 transition-all duration-200"
                disabled={activityLoading}
                onClick={() => fetchActivityFeed()}
              >
                {activityLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-wrap gap-2">
                {(() => {
                  const activityCounts = getActivityCounts(activityFeed);
                  const totalCount = Object.values(activityCounts).reduce((sum, count) => sum + count, 0);

                  return (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${activityFilter === 'all' ? 'bg-primary text-white border-primary' : 'border-secondary/20 hover:border-secondary/40'} transition-all duration-200`}
                        onClick={() => setActivityFilter('all')}
                        disabled={activityLoading}
                      >
                        All
                        {totalCount > 0 && (
                          <span className="ml-2 bg-primary/20 text-xs px-2 py-1 rounded-full">{totalCount}</span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${activityFilter === 'product' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'border-secondary/20 hover:border-secondary/40'} transition-all duration-200`}
                        onClick={() => setActivityFilter('product')}
                        disabled={activityLoading}
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Products
                        {activityCounts.product > 0 && (
                          <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{activityCounts.product}</span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${activityFilter === 'order' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'border-secondary/20 hover:border-secondary/40'} transition-all duration-200`}
                        onClick={() => setActivityFilter('order')}
                        disabled={activityLoading}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Orders
                        {activityCounts.order > 0 && (
                          <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">{activityCounts.order}</span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${activityFilter === 'inventory' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'border-secondary/20 hover:border-secondary/40'} transition-all duration-200`}
                        onClick={() => setActivityFilter('inventory')}
                        disabled={activityLoading}
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Inventory
                        {activityCounts.inventory > 0 && (
                          <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">{activityCounts.inventory}</span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${activityFilter === 'customer' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'border-secondary/20 hover:border-secondary/40'} transition-all duration-200`}
                        onClick={() => setActivityFilter('customer')}
                        disabled={activityLoading}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Customers
                        {activityCounts.customer > 0 && (
                          <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">{activityCounts.customer}</span>
                        )}
                      </Button>
                    </>
                  );
                })()}
              </div>

              <LoadingOverlay loading={activityLoading}>
                {activityFeed && activityFeed.length > 0 ? (
                  <div className="space-y-4">
                    {activityFeed.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-all duration-200"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              activity.type === 'product'
                                ? 'bg-blue-100'
                                : activity.type === 'order'
                                ? 'bg-emerald-100'
                                : activity.type === 'inventory'
                                ? 'bg-purple-100'
                                : activity.type === 'customer'
                                ? 'bg-amber-100'
                                : 'bg-primary/10'
                            }`}
                          >
                            {activity.type === 'product' ? (
                              <Package className="h-5 w-5 text-blue-600" />
                            ) : activity.type === 'order' ? (
                              <ShoppingCart className="h-5 w-5 text-emerald-600" />
                            ) : activity.type === 'inventory' ? (
                              <Package className="h-5 w-5 text-purple-600" />
                            ) : activity.type === 'customer' ? (
                              <Users className="h-5 w-5 text-amber-600" />
                            ) : (
                              <Bell className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary leading-relaxed">{activity.message}</p>
                          <p className="text-xs text-secondary/60 mt-1">{formatDate(activity.timestamp, { format: 'short' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex items-center justify-center">
                    <EmptyState
                      icon={<Bell className="h-12 w-12 text-secondary/30" />}
                      title={activityFilter === 'all' ? 'No recent activity' : `No ${activityFilter} activity`}
                      description={activityFilter === 'all' ? 'There is no recent activity to display.' : `There is no ${activityFilter} activity to display.`}
                    />
                  </div>
                )}
              </LoadingOverlay>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;