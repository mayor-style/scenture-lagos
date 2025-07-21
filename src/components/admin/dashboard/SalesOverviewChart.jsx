import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import { formatPrice } from '../../../lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-primary/20 bg-background p-3 shadow-lg">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-xs uppercase text-muted-foreground">Date</span>
            <span className="text-sm font-semibold text-secondary">{label}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-xs uppercase text-muted-foreground">Sales</span>
            <span className="text-sm font-semibold text-primary">{formatPrice(payload[0].value, { notation: 'compact' })}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const SalesOverviewChart = ({ data }) => {
  const formattedData = data.map((item) => ({
    ...item,
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <Card className="border-primary/20 bg-background">
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="text-xl font-heading text-secondary">Sales Overview</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Sales performance for the selected period
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 pt-0">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatPrice(value, { notation: 'compact' })}
              />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const SalesChartSkeleton = () => (
  <Card className="border-primary/20 bg-background">
    <CardHeader className="p-5 sm:p-6">
      <Skeleton className="h-6 w-1/3 bg-muted/50" />
      <Skeleton className="h-4 w-1/2 bg-muted/50 mt-1" />
    </CardHeader>
    <CardContent className="p-5 sm:p-6 pt-0">
      <div className="h-[350px] w-full flex items-end space-x-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-[calc(100%/12)] bg-muted/50"
            style={{ height: `${Math.random() * 80 + 10}%` }}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);