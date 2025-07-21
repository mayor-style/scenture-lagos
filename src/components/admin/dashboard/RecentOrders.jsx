import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { Skeleton } from '../../ui/Skeleton';
import { formatPrice } from '../../../lib/utils';

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'processing':
    case 'shipped':
      return 'info';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

export const RecentOrders = ({ orders }) => {
  const navigate = useNavigate();
  return (
    <Card className="border-primary/20 bg-background">
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="text-xl font-heading text-secondary">Recent Orders</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          {orders.length} new orders in this period
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-3">
        {orders.map((order) => (
          <div
            key={order._id}
            className="group flex items-center space-x-3 p-3 -m-3 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer"
            onClick={() => navigate(`/admin/orders/${order._id}`)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={order.user?.avatarUrl} alt="Avatar" />
              <AvatarFallback className="text-sm bg-muted/50 text-secondary">
                {order.user
                  ? order.user.firstName?.[0] || 'G'
                  : order.shippingAddress?.firstName?.[0] || 'G'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary truncate">
                {order.user
                  ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Guest Order'
                  : `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() ||
                    'Guest Order'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{order.user?.email || order.shippingAddress?.email || 'N/A'}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm font-semibold text-secondary">{formatPrice(order.totalAmount, { notation: 'compact' })}</p>
              <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const RecentOrdersSkeleton = () => (
  <Card className="border-primary/20 bg-background">
    <CardHeader className="p-5 sm:p-6">
      <Skeleton className="h-6 w-3/5 bg-muted/50" />
      <Skeleton className="h-4 w-4/5 bg-muted/50 mt-1" />
    </CardHeader>
    <CardContent className="p-5 sm:p-6 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full bg-muted/50" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4 bg-muted/50" />
            <Skeleton className="h-3 w-1/2 bg-muted/50" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-16 bg-muted/50" />
            <Skeleton className="h-4 w-12 bg-muted/50" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);