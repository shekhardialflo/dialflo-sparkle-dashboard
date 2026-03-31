import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { useAgents } from '@/hooks/use-agents';

interface DayData {
  date: string;
  qualityScore: number;
  callCount: number;
}

function generateMockData(days: number): DayData[] {
  const data: DayData[] = [];
  const now = new Date();
  const baseScore = 65 + Math.random() * 15;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const trend = ((days - i) / days) * 8;
    const noise = (Math.random() - 0.5) * 12;
    const score = Math.min(100, Math.max(0, Math.round((baseScore + trend + noise) * 10) / 10));
    data.push({
      date: d.toISOString().split('T')[0],
      qualityScore: score,
      callCount: Math.floor(20 + Math.random() * 80),
    });
  }
  return data;
}

function computeSummary(data: DayData[]) {
  if (data.length === 0) return { avg: 0, consistency: 'Low' as const, trend: 'Stable' as const };

  const scores = data.map((d) => d.qualityScore);
  const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

  const mean = avg;
  const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const consistency: 'High' | 'Medium' | 'Low' = stdDev < 4 ? 'High' : stdDev < 8 ? 'Medium' : 'Low';

  const half = Math.floor(data.length / 2);
  const firstHalf = scores.slice(0, half);
  const secondHalf = scores.slice(half);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;
  const trend: 'Improving' | 'Stable' | 'Declining' = diff > 2 ? 'Improving' : diff < -2 ? 'Declining' : 'Stable';

  return { avg, consistency, trend };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DayData;
  const date = new Date(label);
  return (
    <div className="rounded-lg border border-border/50 bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">
        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Quality Score: <span className="font-semibold text-foreground">{d.qualityScore}%</span></p>
        <p>Calls: <span className="font-semibold text-foreground">{d.callCount}</span></p>
      </div>
    </div>
  );
};

export function AgentQualityConsistency() {
  const { data: agents = [] } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [rangeDays, setRangeDays] = useState<string>('14');

  const data = useMemo(() => generateMockData(Number(rangeDays)), [rangeDays, selectedAgent]);
  const { avg, consistency, trend } = useMemo(() => computeSummary(data), [data]);

  const consistencyColor =
    consistency === 'High' ? 'text-green-500' : consistency === 'Medium' ? 'text-yellow-500' : 'text-red-500';
  const trendIcon =
    trend === 'Improving' ? <TrendingUp className="h-3.5 w-3.5" /> :
    trend === 'Declining' ? <TrendingDown className="h-3.5 w-3.5" /> :
    <Minus className="h-3.5 w-3.5" />;
  const trendColor =
    trend === 'Improving' ? 'text-green-500' : trend === 'Declining' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-foreground">Agent Quality Consistency</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Daily average quality score over time</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.agent_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rangeDays} onValueChange={setRangeDays}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="mt-3 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Score:</span>
            <span className="text-sm font-semibold text-foreground">{avg}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Consistency:</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${consistencyColor}`}>
              {consistency}
            </Badge>
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            {trendIcon}
            <span className="text-xs font-medium">{trend}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No data available.
          </div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="gradQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.3}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis
                  yAxisId="score"
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.3}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis yAxisId="calls" orientation="right" hide />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="calls"
                  dataKey="callCount"
                  fill="hsl(var(--muted))"
                  fillOpacity={0.4}
                  radius={[2, 2, 0, 0]}
                  barSize={8}
                />
                <Area
                  yAxisId="score"
                  type="monotone"
                  dataKey="qualityScore"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#gradQuality)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
