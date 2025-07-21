import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bell, ShoppingCart, Users, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/Card';

const iconMap = {
  order: <ShoppingCart className="h-5 w-5 text-green-600" />,
  customer: <Users className="h-5 w-5 text-blue-600" />,
  inventory: <Package className="h-5 w-5 text-red-600" />,
  product: <Package className="h-5 w-5 text-purple-600" />,
  default: <Bell className="h-5 w-5 text-muted-foreground" />,
};

const getIcon = (type) => iconMap[type] || iconMap.default;

export const ActivityFeed = ({ activities }) => {
  const navigate = useNavigate();

  const handleActivityClick = (activity) => {
    if (activity.type === 'order') {
      navigate(`/admin/orders/${activity.id}`);
    }
    if (activity.type === 'product' || activity.type === 'inventory') {
      navigate(`/admin/products/${activity.id}/edit`);
    }
  };

  return (
    <Card className="border-primary/20 bg-background">
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="text-xl font-heading text-secondary">Activity Feed</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Recent events across your store
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="group flex items-start space-x-3 p-3 -m-3 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer"
              onClick={() => handleActivityClick(activity)}
            >
              <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-full flex items-center justify-center bg-muted/50">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary truncate">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ActivityFeedSkeleton = () => (
  <Card className="border-primary/20 bg-background">
    <CardHeader className="p-5 sm:p-6">
      <Skeleton className="h-6 w-1/4 bg-muted/50" />
      <Skeleton className="h-4 w-2/5 bg-muted/50 mt-1" />
    </CardHeader>
    <CardContent className="p-5 sm:p-6 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full bg-muted/50" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-full bg-muted/50" />
            <Skeleton className="h-3 w-1/3 bg-muted/50" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);