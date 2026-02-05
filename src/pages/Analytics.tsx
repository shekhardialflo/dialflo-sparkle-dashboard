import { useState } from 'react';
import { Calendar, Phone, PhoneOff, PhoneForwarded, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
import { analyticsData, campaigns, voiceAgents, insightAgents } from '@/data/mockData';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('7');
  const [assistantFilter, setAssistantFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [includeVoicemail, setIncludeVoicemail] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

      {/* Filter Bar */}
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

        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch
            id="include-voicemail"
            checked={includeVoicemail}
            onCheckedChange={setIncludeVoicemail}
          />
          <Label htmlFor="include-voicemail" className="text-sm">
            Include Voicemail
          </Label>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* KPI Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="shadow-subtle">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attempted</p>
                    <p className="text-2xl font-semibold">
                      {analyticsData.totalAttempted.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--status-success-bg))]">
                    <PhoneForwarded className="h-5 w-5 text-[hsl(var(--status-success))]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Connected</p>
                    <p className="text-2xl font-semibold">
                      {analyticsData.totalConnected.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--status-warning-bg))]">
                    <PhoneOff className="h-5 w-5 text-[hsl(var(--status-warning))]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Not Answered</p>
                    <p className="text-2xl font-semibold">
                      {analyticsData.notAnswered.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--status-info-bg))]">
                    <CheckCircle className="h-5 w-5 text-[hsl(var(--status-info))]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Converted</p>
                    <p className="text-2xl font-semibold">
                      {analyticsData.converted.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="text-2xl font-semibold">
                      {formatDuration(analyticsData.avgDuration)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calls Over Time Chart */}
          <Card className="mb-6 shadow-subtle">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Calls Over Time</CardTitle>
                {/* Notion-style Legend */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-chart-gray"></span>
                    Attempted
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-chart-accent"></span>
                    Connected
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 border-t-2 border-dashed border-chart-accent-dark"></span>
                    Conversion %
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.callsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      strokeOpacity={0.5}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      tick={{ fontSize: 12 }} 
                      stroke="hsl(var(--muted-foreground))"
                      strokeOpacity={0.5}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      strokeOpacity={0.5}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '10px',
                        boxShadow: '0 1px 10px rgba(0, 0, 0, 0.1)',
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
                      stroke="hsl(var(--chart-gray))"
                      strokeWidth={2}
                      dot={false}
                      name="Attempted"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="connected"
                      stroke="hsl(var(--chart-accent))"
                      strokeWidth={2}
                      dot={false}
                      name="Connected"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversionRate"
                      stroke="hsl(var(--chart-accent-dark))"
                      strokeWidth={2}
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
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="text-base">Disposition Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.dispositionBreakdown.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.count.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Campaigns */}
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="text-base">Top Campaigns</CardTitle>
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
          <Card className="shadow-subtle">
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
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{campaign.name}</TableCell>
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

        <TabsContent value="assistants">
          <Card className="shadow-subtle">
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
                  <TableRow key={agent.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{agent.name}</TableCell>
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
                      {agent.callCount.toLocaleString()}
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

        <TabsContent value="insights">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="text-base">Extracted Fields Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Calls with insights</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fields extracted per call</span>
                    <span className="font-medium">4.2 avg</span>
                  </div>
                  <Progress value={84} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Insight Agent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Calls Analyzed</TableHead>
                      <TableHead>Last Run</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insightAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>{agent.callsAnalyzed.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{agent.updatedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
