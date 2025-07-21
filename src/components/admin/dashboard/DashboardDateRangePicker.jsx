import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { Calendar } from '../../ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';

export function DashboardDateRangePicker({ className, dateRange, setDateRange }) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className={cn(
              'w-full sm:w-64 justify-start text-left text-sm bg-background border-primary/20 hover:bg-primary/10 focus:ring-primary/50',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-secondary group-hover:text-primary" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}