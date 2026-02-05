import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RetryStrategy, retryTemplates, callStatusOptions } from '@/types/retryStrategy';

interface RetryStrategySummaryProps {
  strategy: RetryStrategy;
  onEdit?: () => void;
  onViewQueue?: () => void;
}

export function RetryStrategySummary({
  strategy,
  onEdit,
  onViewQueue,
}: RetryStrategySummaryProps) {
  if (!strategy.enabled) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Retry Strategy</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Retry Strategy is off</p>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Enable
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTiming = () => {
    if (strategy.backoffMode === 'FIXED') {
      return `Every ${strategy.minMinutesBetween}m`;
    }
    return strategy.backoffMinutes.map((m) => `${m}m`).join(' → ');
  };

  const formatTrigger = () => {
    switch (strategy.template) {
      case 'NO_ANSWER':
        const statusLabels = (strategy.trigger.statuses || [])
          .map((s) => callStatusOptions.find((o) => o.value === s)?.label || s)
          .join(', ');
        return statusLabels || 'Not configured';
      case 'DISPOSITION':
        const dispositions = strategy.trigger.dispositions || [];
        if (dispositions.length === 0) return 'Not configured';
        if (dispositions.length <= 2) return dispositions.join(', ');
        return `${dispositions.slice(0, 2).join(', ')} +${dispositions.length - 2} more`;
      case 'SHORT_CALL':
        return `Duration < ${strategy.trigger.durationLessThanSec || 30}s`;
      default:
        return '-';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-medium">Retry Strategy</CardTitle>
          </div>
          <div className="flex gap-2">
            {onViewQueue && (
              <Button variant="outline" size="sm" onClick={onViewQueue}>
                View Queue
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Template</span>
            <p className="font-medium">{retryTemplates[strategy.template].label}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Max attempts</span>
            <p className="font-medium">{strategy.maxAttempts}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Timing</span>
            <p className="font-medium">{formatTiming()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Trigger</span>
            <p className="font-medium">{formatTrigger()}</p>
          </div>
        </div>
        {strategy.guardrails.quietHoursEnabled && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Quiet hours: {strategy.guardrails.startHour} - {strategy.guardrails.endHour}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
