import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { addDays } from 'date-fns';
import { motion } from 'framer-motion';
import { RefreshCw, Plus, Package, ShoppingCart, Users } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import DashboardService from '../../services/admin/dashboard.service';
import { DashboardDateRangePicker } from '../../components/admin/dashboard/DashboardDateRangePicker';
import { DashboardMetricCard, MetricCardSkeleton } from '../../components/admin/dashboard/DashboardMetricCard';
import { RecentOrders, RecentOrdersSkeleton } from '../../components/admin/dashboard/RecentOrders';
import { ActivityFeed, ActivityFeedSkeleton } from '../../components/admin/dashboard/ActivityFeed';
import { SalesOverviewChart, SalesChartSkeleton } from '../../components/admin/dashboard/SalesOverviewChart';
import ErrorState from '../../components/ui/ErrorState';
import { formatDate } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [state, setState] = useState({
    isLoading: true,
    error: null,
    summary: null,
    recentOrders: [],
    activityFeed: [],
  });

  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const loadDashboardData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      DashboardService.clearCache();
      const params = {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      };
      const [summaryRes, ordersRes, activityRes] = await Promise.all([
        DashboardService.getDashboardSummary(params),
        DashboardService.getRecentOrders({ limit: 5 }),
        DashboardService.getActivityFeed({ limit: 10 }),
      ]);

      setState({
        isLoading: false,
        error: null,
        summary: summaryRes,
        recentOrders: ordersRes.orders,
        activityFeed: activityRes.activities,
      });
      addToast('Dashboard refreshed', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Could not load dashboard';
      setState({
        isLoading: false,
        error: errorMessage,
        summary: null,
        recentOrders: [],
        activityFeed: [],
      });
      addToast(errorMessage, 'error');
    }
  }, [dateRange]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const { isLoading, error, summary, recentOrders, activityFeed } = state;

  return (
    <>
      <Helmet>
        <title>Dashboard | Scenture Admin</title>
      </Helmet>
      <div className="container mx-auto space-y-6 py-6 sm:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">Overview of your store's performance</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DashboardDateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              disabled={isLoading}
              className="group hover:bg-primary/10"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''} group-hover:text-primary`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/admin/products/new')}
              className="group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:text-background" />
              New Product
            </Button>
          </div>
        </header>

        {error && !isLoading && (
          <ErrorState
            title="Something went wrong"
            message={error}
            onRetry={loadDashboardData}
            className="py-8 px-4 sm:px-6"
          />
        )}

        {/* Metric Cards Grid */}
        <motion.section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
            : [
                {
                  title: 'Total Sales',
                  value: summary?.metrics.totalSales,
                  growth: summary?.metrics.salesGrowth,
                  format: 'price',
                  icon: <Package className="h-6 w-6 text-primary" />,
                  bg: 'bg-primary/10',
                },
                {
                  title: 'Total Orders',
                  value: summary?.metrics.totalOrders,
                  growth: summary?.metrics.ordersGrowth,
                  icon: <ShoppingCart className="h-6 w-6 text-green-600" />,
                  bg: 'bg-green-50',
                },
                {
                  title: 'New Customers',
                  value: summary?.metrics.newCustomers,
                  growth: summary?.metrics.customersGrowth,
                  icon: <Users className="h-6 w-6 text-blue-600" />,
                  bg: 'bg-blue-50',
                },
                {
                  title: 'Inventory Value',
                  value: summary?.metrics.inventoryValue,
                  format: 'price',
                  footerText: `Updated ${summary?.dateRange.endDate ? formatDate(new Date(summary.dateRange.endDate), { addSuffix: true }) : ''}`,
                  icon: <Package className="h-6 w-6 text-purple-600" />,
                  bg: 'bg-purple-50',
                },
              ].map(({ title, value, growth, format, footerText, icon, bg }, index) => (
                <DashboardMetricCard
                  key={index}
                  title={title}
                  value={value}
                  growth={growth}
                  format={format}
                  footerText={footerText}
                  icon={icon}
                  bg={bg}
                />
              ))}
        </motion.section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>{isLoading ? <SalesChartSkeleton /> : <SalesOverviewChart data={summary?.charts.salesChart} />}</div>
          <div>{isLoading ? <RecentOrdersSkeleton /> : <RecentOrders orders={recentOrders} />}</div>
        </section>
        <section className="grid grid-cols-1">
          {isLoading ? <ActivityFeedSkeleton /> : <ActivityFeed activities={activityFeed} />}
        </section>
      </div>
    </>
  );
};

export default DashboardPage;