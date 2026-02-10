import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, TrendingUp, TrendingDown, Info } from 'lucide-react';
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
import { analyticsData, campaigns, voiceAgents } from '@/data/mockData';

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const initialAssistant = searchParams.get('assistant') || 'all';
  
  const [dateRange, setDateRange] = useState('7');
  const [assistantFilter, setAssistantFilter] = useState(initialAssistant);
  const [includeTestCalls, setIncludeTestCalls] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter campaigns by selected assistant
  const filteredCampaigns = assistantFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.assistantId === assistantFilter);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Track performance across calls, campaigns, and assistants"
      />

      {/* Filter Bar - tab-aware */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
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

        {activeTab === 'campaigns' && (
          <Select value={assistantFilter} onValueChange={setAssistantFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Assistants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assistants</SelectItem>
              {voiceAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* KPI Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Attempted</p>
                <p className="text-xl font-semibold text-foreground">
                  {analyticsData.totalAttempted.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Connected</p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.totalConnected.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Answered</p>
                <p className="text-xl font-semibold text-foreground">
                  {analyticsData.totalConnected.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Converted</p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.converted.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatDuration(analyticsData.avgDuration)}
                </p>
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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.callsOverTime}>
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
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="attempted"
                      stroke="hsl(var(--muted-foreground))"
                      strokeOpacity={0.5}
                      strokeWidth={1.5}
                      dot={false}
                      name="Attempted"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="connected"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={false}
                      name="Connected"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversionRate"
                      stroke="hsl(var(--muted-foreground))"
                      strokeOpacity={0.6}
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Conversion %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Disposition Breakdown */}
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
                    Disposition breakdown is available when viewing a specific campaign (dispositions vary by campaign).
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {campaigns.slice(0, 5).map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell className="text-right">{campaign.attempted}</TableCell>
                        <TableCell className="text-right">{campaign.answerRate}%</TableCell>
                        <TableCell className="text-right">{campaign.conversion}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
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
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="cursor-pointer hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">{campaign.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={getCampaignStatus(campaign.status)}>
                        {campaign.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.attempted.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.connected.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{campaign.answerRate}%</TableCell>
                    <TableCell className="text-right">{campaign.conversion}%</TableCell>
                    <TableCell className="text-right">
                      {Math.random() > 0.5 ? (
                        <TrendingUp className="ml-auto h-4 w-4 text-status-success" />
                      ) : (
                        <TrendingDown className="ml-auto h-4 w-4 text-status-error" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="assistants">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assistant</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead className="text-right">Total Calls</TableHead>
                  <TableHead className="text-right">Avg Duration</TableHead>
                  <TableHead className="text-right">Conversion</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voiceAgents.map((agent) => (
                  <TableRow key={agent.id} className="cursor-pointer hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">{agent.name}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          agent.direction === 'inbound'
                            ? 'info'
                            : agent.direction === 'outbound'
                            ? 'success'
                            : 'neutral'
                        }
                      >
                        {agent.direction}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.floor(Math.random() * 5000 + 200).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDuration(Math.floor(Math.random() * 300 + 120))}
                    </TableCell>
                    <TableCell className="text-right">
                      {(Math.random() * 30 + 10).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.random() > 0.5 ? (
                        <TrendingUp className="ml-auto h-4 w-4 text-[hsl(var(--status-success))]" />
                      ) : (
                        <TrendingDown className="ml-auto h-4 w-4 text-[hsl(var(--status-error))]" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
