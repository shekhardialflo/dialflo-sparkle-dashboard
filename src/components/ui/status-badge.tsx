import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

// Low saturation status colors - calm, Notion-inspired
const statusStyles = {
  success: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success))] border-transparent',
  warning: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning))] border-transparent',
  error: 'bg-[hsl(var(--status-error-bg))] text-[hsl(var(--status-error))] border-transparent',
  info: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info))] border-transparent',
  neutral: 'bg-muted text-muted-foreground border-transparent',
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
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
