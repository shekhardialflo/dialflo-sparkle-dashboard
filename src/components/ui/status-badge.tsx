import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

// Low saturation status colors - calm, Notion-inspired
const statusStyles = {
  success: 'bg-[hsl(142_40%_94%)] text-[hsl(142_50%_35%)] border-transparent',
  warning: 'bg-[hsl(40_50%_94%)] text-[hsl(32_70%_40%)] border-transparent',
  error: 'bg-[hsl(0_50%_95%)] text-[hsl(0_55%_45%)] border-transparent',
  info: 'bg-[hsl(217_50%_95%)] text-[hsl(217_60%_50%)] border-transparent',
  neutral: 'bg-muted/70 text-muted-foreground border-transparent',
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
