import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, TrendingUp, TrendingDown, Info, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge, getCampaignStatus } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MultiSelectFilter } from '@/components/analytics/MultiSelectFilter';
import { useDashboardDailyCalls } from '@/hooks/use-analytics';
import { useAgents } from '@/hooks/use-agents';
import { useCampaigns } from '@/hooks/use-campaigns';
import type { CampaignResponse } from '@/types/api';

// ----- Helpers -----

function mapCampaignStatus(status: string): string {
  const map: Record<string, string> = {
    DRAFTED: 'draft',
    SCHEDULED: 'scheduled',
    QUEUED: 'running',
    IN_PROGRESS: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FAILED: 'failed',
  };
  return map[status] || status.toLowerCase();
}

function getCampaignMetrics(summary: Record<string, unknown> | null) {
  if (!summary) return { attempted: 0, connected: 0, answerRate: 0, conversion: 0 };
  const values = Object.values(summary).map(Number).filter((n) => !isNaN(n));
  const attempted = values.reduce((a, b) => a + b, 0);
  const connected = Number(summary['ANSWERED']) || 0;
  const answerRate = attempted > 0 ? (connected / attempted) * 100 : 0;
  return {
    attempted,
    connected,
    answerRate: Math.round(answerRate * 10) / 10,
    conversion: 0,
  };
}

type CallDirection = 'all' | 'inbound' | 'outbound';

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const initialAssistant = searchParams.get('assistant');

  const [dateRange, setDateRange] = useState('7');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    initialAssistant ? [initialAssistant] : []
  );
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>([]);
  const [callDirection, setCallDirection] = useState<CallDirection>('all');
  const [includeTestCalls, setIncludeTestCalls] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // ----- API hooks -----
  const daysMap: Record<string, number> = { '7': 7, '30': 30, '90': 90 };
  const days = daysMap[dateRange] || 30;

  const { data: dailyCallsData, isLoading: dailyLoading } = useDashboardDailyCalls({
    days,
    exclude_internal_calls: !includeTestCalls,
  });
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: campaignsData = [], isLoading: campaignsLoading } = useCampaigns();

  // ----- Options for multi-selects -----
  const agentOptions = useMemo(() =>
    agents.map(a => ({ value: String(a.id), label: a.agent_name })),
    [agents]
  );

  // ----- Derived values (ALL agents by default) -----
  const totalCalls = dailyCallsData?.summary?.total_calls ?? 0;

  const { totalAnswered, totalFailed } = useMemo(() => {
    const daily = dailyCallsData?.daily ?? [];
    return daily.reduce(
      (acc, d) => ({
        totalAnswered: acc.totalAnswered + (d.answered_calls ?? 0),
        totalFailed: acc.totalFailed + (d.failed_calls ?? 0),
      }),
      { totalAnswered: 0, totalFailed: 0 }
    );
  }, [dailyCallsData]);

  // Chart data mapped from daily entries
  const chartData = useMemo(() => {
    const daily = dailyCallsData?.daily ?? [];
    return daily.map((d) => ({
      date: d.date,
      attempted: d.total_calls,
      connected: d.answered_calls,
      conversionRate:
        d.total_calls > 0
          ? Math.round((d.answered_calls / d.total_calls) * 1000) / 10
          : 0,
    }));
  }, [dailyCallsData]);

  // Filter campaigns by selected agents (multi-select)
  const filteredCampaigns = useMemo(() => {
    if (selectedAgents.length === 0) return campaignsData;
    return campaignsData.filter(
      (c: CampaignResponse) => selectedAgents.includes(String(c.agent_id))
    );
  }, [campaignsData, selectedAgents]);

  // Filter agents for Assistants tab (multi-select)
  const filteredAssistants = useMemo(() => {
    if (selectedAssistants.length === 0) return agents;
    return agents.filter(a => selectedAssistants.includes(String(a.id)));
  }, [agents, selectedAssistants]);

  // ----- Loading skeleton for KPI cards -----
  const KpiSkeleton = () => (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Track performance across calls, campaigns, and agents"
      />

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-36">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* Multi-select agents – shown on Overview and Campaigns tabs */}
        {(activeTab === 'overview' || activeTab === 'campaigns') && (
          <MultiSelectFilter
            label="Agents"
            options={agentOptions}
            selected={selectedAgents}
            onChange={setSelectedAgents}
          />
        )}

        {/* Multi-select agents – shown on Agents tab */}
        {activeTab === 'assistants' && (
          <MultiSelectFilter
            label="Agents"
            options={agentOptions}
            selected={selectedAssistants}
            onChange={setSelectedAssistants}
          />
        )}

        {/* Call Direction filter */}
        <Select value={callDirection} onValueChange={(v) => setCallDirection(v as CallDirection)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Calls</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch
            id="include-test-calls"
            checked={includeTestCalls}
            onCheckedChange={setIncludeTestCalls}
          />
          <Label htmlFor="include-test-calls" className="text-sm">
            Include Internal Testing Calls
          </Label>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="assistants">Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* KPI Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Attempted</p>
                {dailyLoading ? <KpiSkeleton /> : (
                  <p className="text-xl font-semibold text-foreground">
                    {totalCalls.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Connected</p>
                {dailyLoading ? <KpiSkeleton /> : (
                  <p className="text-2xl font-bold text-foreground">
                    {totalAnswered.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Answered</p>
                {dailyLoading ? <KpiSkeleton /> : (
                  <p className="text-xl font-semibold text-foreground">
                    {totalAnswered.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Failed</p>
                {dailyLoading ? <KpiSkeleton /> : (
                  <p className="text-2xl font-bold text-foreground">
                    {totalFailed.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
                <p className="text-xl font-semibold text-muted-foreground">N/A</p>
              </CardContent>
            </Card>
          </div>

          {/* Calls Over Time Chart */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Calls Over Time</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/40"></span>
                    Attempted
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary"></span>
                    Connected
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-3 border-t border-dashed border-muted-foreground/60"></span>
                    Conversion %
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dailyLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No data available for the selected period.
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" strokeOpacity={0.25} vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        stroke="hsl(var(--muted-foreground))"
                        strokeOpacity={0.3}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 10 }}
                        stroke="hsl(var(--muted-foreground))"
                        strokeOpacity={0.3}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                        stroke="hsl(var(--muted-foreground))"
                        strokeOpacity={0.3}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border) / 0.5)',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                          fontSize: '11px',
                        }}
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="attempted" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} strokeWidth={1.5} dot={false} name="Attempted" />
                      <Line yAxisId="left" type="monotone" dataKey="connected" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Connected" />
                      <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.6} strokeWidth={1} strokeDasharray="5 5" dot={false} name="Conversion %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Disposition Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 mb-3">
                    <Info className="h-5 w-5 text-muted-foreground/70" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-[280px]">
                    Disposition breakdown is available when viewing a specific campaign.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : campaignsData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No campaigns available.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead className="text-right">Attempted</TableHead>
                        <TableHead className="text-right">Answer %</TableHead>
                        <TableHead className="text-right">Conv %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignsData.slice(0, 5).map((campaign: CampaignResponse) => {
                        const metrics = getCampaignMetrics(campaign.call_status_summary);
                        return (
                          <TableRow key={campaign.campaign_id}>
                            <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
                            <TableCell className="text-right">{metrics.attempted}</TableCell>
                            <TableCell className="text-right">{metrics.answerRate}%</TableCell>
                            <TableCell className="text-right">{metrics.conversion}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No campaigns found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Attempted</TableHead>
                    <TableHead className="text-right">Connected</TableHead>
                    <TableHead className="text-right">Answer Rate</TableHead>
                    <TableHead className="text-right">Conversion</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign: CampaignResponse) => {
                    const displayStatus = mapCampaignStatus(campaign.status);
                    const metrics = getCampaignMetrics(campaign.call_status_summary);
                    return (
                      <TableRow key={campaign.campaign_id} className="cursor-pointer hover:bg-muted/20">
                        <TableCell className="font-medium text-foreground">
                          {campaign.campaign_name}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getCampaignStatus(displayStatus)}>
                            {displayStatus}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          {metrics.attempted.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {metrics.connected.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{metrics.answerRate}%</TableCell>
                        <TableCell className="text-right">{metrics.conversion}%</TableCell>
                        <TableCell className="text-right">
                          {metrics.answerRate >= 50 ? (
                            <TrendingUp className="ml-auto h-4 w-4 text-status-success" />
                          ) : (
                            <TrendingDown className="ml-auto h-4 w-4 text-status-error" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="assistants">
          <Card>
            {agentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAssistants.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No agents found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead className="text-right">Total Calls</TableHead>
                    <TableHead className="text-right">Avg Duration</TableHead>
                    <TableHead className="text-right">Conversion</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssistants.map((agent) => {
                    const direction = agent.call_type === 'INCOMING' ? 'inbound' : 'outbound';
                    return (
                      <TableRow key={agent.id} className="cursor-pointer hover:bg-muted/20">
                        <TableCell className="font-medium text-foreground">
                          {agent.agent_name}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={direction === 'inbound' ? 'info' : 'success'}>
                            {direction}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">—</TableCell>
                        <TableCell className="text-right text-muted-foreground">—</TableCell>
                        <TableCell className="text-right text-muted-foreground">—</TableCell>
                        <TableCell className="text-right text-muted-foreground">—</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
