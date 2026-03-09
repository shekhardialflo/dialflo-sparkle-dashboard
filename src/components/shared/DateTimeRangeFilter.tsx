import { useState, useMemo } from 'react';
import { CalendarIcon, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DateTimeRangeFilterProps {
  /** Preset value like '7','30','90' or 'custom' */
  preset: string;
  onPresetChange: (preset: string) => void;
  fromDate?: Date;
  toDate?: Date;
  fromTime?: string;
  toTime?: string;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onFromTimeChange: (time: string) => void;
  onToTimeChange: (time: string) => void;
  className?: string;
  /** Whether to show time selectors (default true) */
  showTime?: boolean;
}

const presetOptions = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
];

export function DateTimeRangeFilter({
  preset,
  onPresetChange,
  fromDate,
  toDate,
  fromTime = '06:00',
  toTime = '23:00',
  onFromDateChange,
  onToDateChange,
  onFromTimeChange,
  onToTimeChange,
  className,
  showTime = true,
}: DateTimeRangeFilterProps) {
  const timeOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    for (let h = 6; h <= 23; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour12 = h % 12 || 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
        const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        opts.push({ value: val, label });
      }
    }
    return opts;
  }, []);

  const handlePresetChange = (value: string) => {
    onPresetChange(value);
    if (value !== 'custom') {
      onFromDateChange(undefined);
      onToDateChange(undefined);
    }
  };

  const summaryText = useMemo(() => {
    if (preset !== 'custom') return null;
    const parts: string[] = [];
    if (fromDate) parts.push(format(fromDate, 'MMM d'));
    if (toDate) parts.push(format(toDate, 'MMM d'));
    return parts.length === 2 ? parts.join(' – ') : parts.length === 1 ? parts[0] : null;
  }, [preset, fromDate, toDate]);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-40">
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presetOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2">
          {/* From date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-9 min-w-[130px] justify-start text-sm font-normal',
                  !fromDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, 'dd-MM-yyyy') : 'From date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={onFromDateChange}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>

          {/* From time */}
          {showTime && (
            <Select value={fromTime} onValueChange={onFromTimeChange}>
              <SelectTrigger className="w-32 h-9">
                <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <span className="text-sm text-muted-foreground">to</span>

          {/* To date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-9 min-w-[130px] justify-start text-sm font-normal',
                  !toDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, 'dd-MM-yyyy') : 'To date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={onToDateChange}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>

          {/* To time */}
          {showTime && (
            <Select value={toTime} onValueChange={onToTimeChange}>
              <SelectTrigger className="w-32 h-9">
                <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="End time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Clear custom */}
          {(fromDate || toDate) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                onFromDateChange(undefined);
                onToDateChange(undefined);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
