import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock,
  Plus
} from 'lucide-react';

// Sample data for demonstration
const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 6390 },
  { name: 'Sun', sales: 3490 },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'John Doe', date: '2023-05-15', total: 12500, status: 'Delivered' },
  { id: 'ORD-002', customer: 'Jane Smith', date: '2023-05-14', total: 8700, status: 'Processing' },
  { id: 'ORD-003', customer: 'Robert Johnson', date: '2023-05-14', total: 5300, status: 'Pending' },
  { id: 'ORD-004', customer: 'Emily Davis', date: '2023-05-13', total: 15000, status: 'Shipped' },
  { id: 'ORD-005', customer: 'Michael Brown', date: '2023-05-12', total: 3200, status: 'Delivered' },
];

const DashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | Scenture Lagos Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-medium text-secondary">Dashboard</h1>
            <p className="text-secondary/70 mt-1">Welcome back to your admin dashboard</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button variant="default" className="flex items-center">
              <Plus size={16} className="mr-2" />
              New Product
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary/70">Total Sales</p>
                  <h3 className="text-2xl font-heading font-medium mt-1">{formatPrice(1250000)}</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp size={14} className="mr-1" /> +12.5% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <DollarSign size={20} className="text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary/70">Total Orders</p>
                  <h3 className="text-2xl font-heading font-medium mt-1">156</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp size={14} className="mr-1" /> +8.2% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <ShoppingCart size={20} className="text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary/70">Inventory Value</p>
                  <h3 className="text-2xl font-heading font-medium mt-1">{formatPrice(3450000)}</h3>
                  <p className="text-xs text-secondary/70 flex items-center mt-1">
                    <Clock size={14} className="mr-1" /> Updated 2 hours ago
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Package size={20} className="text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary/70">New Customers</p>
                  <h3 className="text-2xl font-heading font-medium mt-1">24</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp size={14} className="mr-1" /> +4.6% from last week
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Last 7 days sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#E5D3C8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="default" className="w-full justify-start">
                  <Plus size={16} className="mr-2" />
                  Add New Product
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingCart size={16} className="mr-2" />
                  View Pending Orders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package size={16} className="mr-2" />
                  Update Inventory
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users size={16} className="mr-2" />
                  View Customer List
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-medium p-3 pl-0">Order ID</th>
                    <th className="text-left font-medium p-3">Customer</th>
                    <th className="text-left font-medium p-3">Date</th>
                    <th className="text-left font-medium p-3">Amount</th>
                    <th className="text-left font-medium p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 pl-0">{order.id}</td>
                      <td className="p-3">{order.customer}</td>
                      <td className="p-3">{order.date}</td>
                      <td className="p-3">{formatPrice(order.total)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardPage;