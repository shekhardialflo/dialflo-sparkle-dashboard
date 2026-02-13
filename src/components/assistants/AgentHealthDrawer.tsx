import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { RefreshCw, Loader2 } from 'lucide-react';
import type { CallAgentResponse } from '@/types/api';
import { useAgentHealth } from '@/hooks/use-agents';

const STATUS_MAP: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  healthy: 'success',
  degraded: 'warning',
  down: 'error',
  unknown: 'neutral',
  pass: 'success',
  fail: 'error',
  ok: 'success',
};

interface HealthCheckItem {
  name: string;
  status: string;
  latency: number | null;
  error: string | null;
}

// Parse the checks object from API response into a flat list for the UI
function parseHealthChecks(checks: Record<string, unknown>): HealthCheckItem[] {
  const items: HealthCheckItem[] = [];
  for (const [name, value] of Object.entries(checks)) {
    if (value && typeof value === 'object') {
      const check = value as Record<string, unknown>;
      items.push({
        name,
        status: typeof check.status === 'string' ? check.status : 'unknown',
        latency: typeof check.latency === 'number' ? check.latency : null,
        error: typeof check.error === 'string' ? check.error : null,
      });
    } else {
      items.push({
        name,
        status: typeof value === 'string' ? value : 'unknown',
        latency: null,
        error: null,
      });
    }
  }
  return items;
}

interface AgentHealthDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: CallAgentResponse | null;
}

export function AgentHealthDrawer({ open, onOpenChange, agent }: AgentHealthDrawerProps) {
  const agentId = agent?.id ?? 0;
  const {
    data: healthData,
    isLoading: checking,
    refetch,
    dataUpdatedAt,
  } = useAgentHealth(agentId, open && agentId > 0);

  const [autoRefresh, setAutoRefresh] = useState(() => {
    return localStorage.getItem('health-auto-refresh') !== 'false';
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-refresh interval using refetch
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (open && autoRefresh && agentId > 0) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, 5 * 60 * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, autoRefresh, agentId, refetch]);

  const handleAutoRefreshChange = (val: boolean) => {
    setAutoRefresh(val);
    localStorage.setItem('health-auto-refresh', String(val));
  };

  if (!agent) return null;

  const healthChecks = healthData?.checks ? parseHealthChecks(healthData.checks) : [];
  const overallStatus = healthData?.overall_status || 'unknown';
  const lastChecked = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Agent Health – {agent.agent_name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Overall status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Overall:</span>
            <StatusBadge status={STATUS_MAP[overallStatus] || 'neutral'}>
              {overallStatus}
            </StatusBadge>
          </div>

          {/* Auto-refresh + last checked */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={autoRefresh} onCheckedChange={handleAutoRefreshChange} />
              <span className="text-xs text-muted-foreground">Auto-refresh every 5 min</span>
            </div>
            {!autoRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={checking}
                className="text-xs"
              >
                {checking ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Checking…
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Recheck now
                  </>
                )}
              </Button>
            )}
          </div>

          {lastChecked && (
            <p className="text-[11px] text-muted-foreground">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}

          {/* Health table */}
          {healthChecks.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Integration</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Latency</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {healthChecks.map((item) => (
                    <tr key={item.name} className="border-b border-border/40 last:border-0">
                      <td className="px-3 py-2.5 font-medium text-foreground text-xs">{item.name}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={STATUS_MAP[item.status] || 'neutral'}>
                          {item.status}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs text-muted-foreground tabular-nums">
                        {item.latency !== null ? `${item.latency}ms` : '–'}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[120px] truncate" title={item.error || ''}>
                        {item.error || '–'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !checking ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">No health check data available.</p>
            </div>
          ) : null}

          {checking && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Running health checks…
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
