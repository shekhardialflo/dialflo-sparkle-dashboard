import { useState, useMemo } from 'react';
import { Receipt, Building2, Bot, Calculator, Phone, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { DateTimeRangeFilter } from '@/components/shared/DateTimeRangeFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { callRecords, voiceAgents } from '@/data/mockData';

// --- Mock Organizations ---
const organizations = [
  { id: 'all', name: 'All Organizations' },
  { id: 'org-1', name: 'Dialflo' },
  { id: 'org-2', name: 'Intugine' },
  { id: 'org-3', name: 'Caredale' },
  { id: 'org-4', name: 'Careernet' },
  { id: 'org-5', name: 'Onest' },
];

// Map agents to orgs for demo
const agentOrgMap: Record<string, string> = {
  va1: 'org-1',
  va2: 'org-1',
  va3: 'org-2',
  va4: 'org-3',
  va5: 'org-4',
  va6: 'org-4',
  va7: 'org-5',
  va8: 'org-2',
};

/** Bracket billing: ceil to nearest minute per call */
function bracketMinutes(durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return Math.ceil(durationSeconds / 60);
}

export default function Billing() {
  // Filters
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [preset, setPreset] = useState('30');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [fromTime, setFromTime] = useState('06:00');
  const [toTime, setToTime] = useState('23:00');

  // Agents filtered by org
  const filteredAgents = useMemo(() => {
    if (selectedOrg === 'all') return voiceAgents;
    return voiceAgents.filter((a) => agentOrgMap[a.id] === selectedOrg);
  }, [selectedOrg]);

  // Reset agent selection when org changes
  const handleOrgChange = (org: string) => {
    setSelectedOrg(org);
    setSelectedAgentIds([]);
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const selectAllAgents = () => {
    if (selectedAgentIds.length === filteredAgents.length) {
      setSelectedAgentIds([]);
    } else {
      setSelectedAgentIds(filteredAgents.map((a) => a.id));
    }
  };

  // Date range filter
  const dateRange = useMemo(() => {
    const now = new Date();
    if (preset === 'custom') {
      return { from: fromDate, to: toDate };
    }
    const days = parseInt(preset, 10);
    const from = new Date(now);
    from.setDate(from.getDate() - days);
    return { from, to: now };
  }, [preset, fromDate, toDate]);

  // Filter calls
  const filteredCalls = useMemo(() => {
    const activeAgentIds =
      selectedAgentIds.length > 0
        ? selectedAgentIds
        : filteredAgents.map((a) => a.id);

    return callRecords.filter((call) => {
      // Agent filter
      if (!activeAgentIds.includes(call.assistantId)) return false;

      // Only connected calls with duration
      if (call.status !== 'connected' || call.duration <= 0) return false;

      // Date filter
      const callDate = new Date(call.calledAt);
      if (dateRange.from && callDate < dateRange.from) return false;
      if (dateRange.to && callDate > dateRange.to) return false;

      return true;
    });
  }, [selectedAgentIds, filteredAgents, dateRange]);

  // Billing calculations — per-call bracket then sum
  const billingData = useMemo(() => {
    const perCallMinutes = filteredCalls.map((call) => ({
      ...call,
      billedMinutes: bracketMinutes(call.duration),
      rawSeconds: call.duration,
    }));

    const totalBilledMinutes = perCallMinutes.reduce((sum, c) => sum + c.billedMinutes, 0);
    const totalRawSeconds = perCallMinutes.reduce((sum, c) => sum + c.rawSeconds, 0);
    const totalCalls = perCallMinutes.length;

    // Breakdown per agent
    const agentBreakdown = new Map<
      string,
      { agentName: string; calls: number; billedMinutes: number; rawSeconds: number }
    >();

    for (const call of perCallMinutes) {
      const existing = agentBreakdown.get(call.assistantId) || {
        agentName: call.assistantName,
        calls: 0,
        billedMinutes: 0,
        rawSeconds: 0,
      };
      existing.calls += 1;
      existing.billedMinutes += call.billedMinutes;
      existing.rawSeconds += call.rawSeconds;
      agentBreakdown.set(call.assistantId, existing);
    }

    return {
      perCallMinutes,
      totalBilledMinutes,
      totalRawSeconds,
      totalCalls,
      agentBreakdown: Array.from(agentBreakdown.entries()).map(([id, data]) => ({
        agentId: id,
        ...data,
      })),
    };
  }, [filteredCalls]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Track usage and billed minutes across agents and organizations"
        icon={<Receipt className="h-6 w-6" />}
      />

      {/* Filters Row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Organization Filter */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Organization</label>
          <Select value={selectedOrg} onValueChange={handleOrgChange}>
            <SelectTrigger className="w-52">
              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Duration</label>
          <DateTimeRangeFilter
            preset={preset}
            onPresetChange={setPreset}
            fromDate={fromDate}
            toDate={toDate}
            fromTime={fromTime}
            toTime={toTime}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onFromTimeChange={setFromTime}
            onToTimeChange={setToTime}
            showTime={false}
          />
        </div>
      </div>

      {/* Agent Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              Select Agents
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={selectAllAgents}>
              {selectedAgentIds.length === filteredAgents.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filteredAgents.map((agent) => {
              const isSelected = selectedAgentIds.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent'
                  )}
                >
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                  <span>{agent.name}</span>
                </button>
              );
            })}
            {filteredAgents.length === 0 && (
              <p className="text-sm text-muted-foreground">No agents found for this organization.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold text-foreground">{billingData.totalCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Clock className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Raw Duration</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(billingData.totalRawSeconds)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billed Minutes</p>
                <p className="text-2xl font-bold text-primary">
                  {billingData.totalBilledMinutes} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billing Overhead</p>
                <p className="text-2xl font-bold text-foreground">
                  {billingData.totalRawSeconds > 0
                    ? `+${Math.round(
                        ((billingData.totalBilledMinutes * 60 - billingData.totalRawSeconds) /
                          billingData.totalRawSeconds) *
                          100
                      )}%`
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Breakdown Table */}
      {billingData.agentBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Raw Duration</TableHead>
                  <TableHead className="text-right">Billed Minutes</TableHead>
                  <TableHead className="text-right">Overhead</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingData.agentBreakdown.map((row) => {
                  const overhead =
                    row.rawSeconds > 0
                      ? Math.round(
                          ((row.billedMinutes * 60 - row.rawSeconds) / row.rawSeconds) * 100
                        )
                      : 0;
                  return (
                    <TableRow key={row.agentId}>
                      <TableCell className="font-medium">{row.agentName}</TableCell>
                      <TableCell className="text-right">{row.calls}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDuration(row.rawSeconds)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {row.billedMinutes} min
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          +{overhead}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Totals row */}
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{billingData.totalCalls}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDuration(billingData.totalRawSeconds)}
                  </TableCell>
                  <TableCell className="text-right text-primary">
                    {billingData.totalBilledMinutes} min
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {billingData.totalRawSeconds > 0
                        ? `+${Math.round(
                            ((billingData.totalBilledMinutes * 60 - billingData.totalRawSeconds) /
                              billingData.totalRawSeconds) *
                              100
                          )}%`
                        : '—'}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Per-Call Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Call-level Billing Detail
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (each call rounded up to nearest minute)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Callee</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Bracket</TableHead>
                  <TableHead className="text-right">Billed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingData.perCallMinutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No calls found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  billingData.perCallMinutes.map((call) => {
                    const lower = (call.billedMinutes - 1) * 60 + 1;
                    const upper = call.billedMinutes * 60;
                    return (
                      <TableRow key={call.id}>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(call.calledAt), 'dd MMM, hh:mm a')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{call.calleeName}</p>
                            <p className="text-xs text-muted-foreground">{call.calleePhone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{call.assistantName}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {call.rawSeconds}s
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-xs font-mono">
                            {lower}–{upper}s
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {call.billedMinutes} min
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Billing Note */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Billing Logic:</strong> Each call is rounded up to the nearest minute.
          A call lasting 1–60 seconds = 1 minute, 61–120 seconds = 2 minutes, and so on. 
          Minutes are calculated per call individually, not as a sum of raw seconds.
        </p>
      </div>
    </div>
  );
}
