import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import { formatPrice } from '../../../lib/utils';

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

export const DashboardMetricCard = ({ title, value, growth, format, footerText, icon, bg }) => {
  const isPositive = growth >= 0;
  const displayValue = format === 'price' ? formatPrice(value, { notation: 'compact' }) : value?.toLocaleString() || '0';

  return (
    <motion.div variants={cardVariants}>
      <Card className="group border-primary/20 bg-background hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center`}>{icon}</div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="text-xl font-semibold text-secondary tracking-tight">{displayValue}</div>
          {growth !== undefined && growth !== null ? (
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
              <span className={`flex items-center font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`mr-1 h-4 w-4 ${!isPositive && 'rotate-180'}`} />
                {isPositive ? '+' : ''}{growth}%
              </span>
              <span className="ml-1">from last period</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1.5">{footerText || ' '}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const MetricCardSkeleton = () => (
  <Card className="border-primary/20 bg-background">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5">
      <Skeleton className="h-4 w-2/4 bg-muted/50" />
      <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
    </CardHeader>
    <CardContent className="p-5 pt-0">
      <Skeleton className="h-6 w-3/4 bg-muted/50 mb-2" />
      <Skeleton className="h-3 w-full bg-muted/50" />
    </CardContent>
  </Card>
);