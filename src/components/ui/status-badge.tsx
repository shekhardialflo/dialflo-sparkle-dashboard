import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

const statusStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}

// Campaign status mapping
export function getCampaignStatus(status: string): StatusBadgeProps['status'] {
  switch (status) {
    case 'running':
      return 'success';
    case 'scheduled':
      return 'info';
    case 'completed':
      return 'neutral';
    case 'paused':
      return 'warning';
    case 'draft':
      return 'neutral';
    default:
      return 'neutral';
  }
}

// Call status mapping
export function getCallStatus(status: string): StatusBadgeProps['status'] {
  switch (status) {
    case 'connected':
      return 'success';
    case 'voicemail':
      return 'info';
    case 'not_answered':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'neutral';
  }
}
