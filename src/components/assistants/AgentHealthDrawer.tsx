import { useState, useEffect, useCallback, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { RefreshCw, Loader2 } from 'lucide-react';
import { type VoiceAgent } from '@/data/mockData';

interface IntegrationHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency: number | null;
  error: string | null;
}

const STATUS_MAP: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  healthy: 'success',
  degraded: 'warning',
  down: 'error',
  unknown: 'neutral',
};

function simulateHealthCheck(): Promise<IntegrationHealth[]> {
  type HealthStatus = IntegrationHealth['status'];
  return new Promise((resolve) => {
    setTimeout(() => {
      const items: IntegrationHealth[] = [
        {
          name: 'Azure OpenAI',
          status: (Math.random() > 0.1 ? (Math.random() > 0.2 ? 'healthy' : 'degraded') : 'down') as HealthStatus,
          latency: Math.floor(100 + Math.random() * 400),
          error: Math.random() > 0.9 ? 'Timeout on completion endpoint' : null,
        },
        {
          name: 'ElevenLabs',
          status: (Math.random() > 0.05 ? (Math.random() > 0.15 ? 'healthy' : 'degraded') : 'down') as HealthStatus,
          latency: Math.floor(200 + Math.random() * 500),
          error: null,
        },
        {
          name: 'Deepgram',
          status: (Math.random() > 0.08 ? (Math.random() > 0.1 ? 'healthy' : 'degraded') : 'down') as HealthStatus,
          latency: Math.floor(300 + Math.random() * 800),
          error: null,
        },
      ];
      resolve(items.map((item) => {
        if (item.latency && item.latency >= 1500) item.status = 'degraded';
        if (item.error && item.status !== 'down') item.status = 'degraded';
        if (item.status === 'down') {
          item.error = item.error || 'Connection refused';
          item.latency = null;
        }
        return item;
      }));
    }, 800 + Math.random() * 600);
  });
}

interface AgentHealthDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: VoiceAgent | null;
}

export function AgentHealthDrawer({ open, onOpenChange, agent }: AgentHealthDrawerProps) {
  const [health, setHealth] = useState<IntegrationHealth[]>([
    { name: 'Azure OpenAI', status: 'unknown', latency: null, error: null },
    { name: 'ElevenLabs', status: 'unknown', latency: null, error: null },
    { name: 'Deepgram', status: 'unknown', latency: null, error: null },
  ]);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    return localStorage.getItem('health-auto-refresh') !== 'false';
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runCheck = useCallback(async () => {
    setChecking(true);
    try {
      const results = await simulateHealthCheck();
      setHealth(results);
      setLastChecked(new Date());
    } finally {
      setChecking(false);
    }
  }, []);

  // Run check on open
  useEffect(() => {
    if (open && agent) {
      runCheck();
    }
  }, [open, agent, runCheck]);

  // Auto-refresh interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (open && autoRefresh) {
      intervalRef.current = setInterval(runCheck, 5 * 60 * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, autoRefresh, runCheck]);

  const handleAutoRefreshChange = (val: boolean) => {
    setAutoRefresh(val);
    localStorage.setItem('health-auto-refresh', String(val));
  };

  if (!agent) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Agent Health – {agent.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
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
                onClick={runCheck}
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
                {health.map((item) => (
                  <tr key={item.name} className="border-b border-border/40 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-foreground text-xs">{item.name}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={STATUS_MAP[item.status]}>
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
