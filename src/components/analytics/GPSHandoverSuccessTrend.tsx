import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

type Period = 'week' | 'month' | 'year';

function generateWeeklyData() {
  const data = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = 30 + (14 - i) * 1.8;
    const handovers = Math.round(base + Math.random() * 10);
    const total = Math.round(100 + Math.random() * 60);
    data.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalRelevantCalls: total,
      successfulHandovers: Math.min(handovers, total),
      gpsHandoverRate: Math.min(100, Math.round((Math.min(handovers, total) / total) * 100 * 10) / 10),
      arrivalPending: Math.round(10 + Math.random() * 15),
      unloadingPending: Math.round(8 + Math.random() * 12),
      escalations: Math.round(2 + Math.random() * 6),
    });
  }
  return data;
}

function generateMonthlyData() {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  return months.map((m, i) => {
    const total = Math.round(400 + Math.random() * 300 + i * 40);
    const rate = Math.min(100, Math.round((28 + i * 5.5 + Math.random() * 6) * 10) / 10);
    const handovers = Math.round((rate / 100) * total);
    return {
      label: m,
      totalRelevantCalls: total,
      successfulHandovers: handovers,
      gpsHandoverRate: rate,
      arrivalPending: Math.round(40 + Math.random() * 30),
      unloadingPending: Math.round(30 + Math.random() * 25),
      escalations: Math.round(8 + Math.random() * 12),
    };
  });
}

function generateYearlyData() {
  return ['2023', '2024', '2025', '2026'].map((y, i) => {
    const total = Math.round(3000 + i * 1200 + Math.random() * 500);
    const rate = Math.min(100, Math.round((22 + i * 15 + Math.random() * 5) * 10) / 10);
    const handovers = Math.round((rate / 100) * total);
    return {
      label: y,
      totalRelevantCalls: total,
      successfulHandovers: handovers,
      gpsHandoverRate: rate,
      arrivalPending: Math.round(300 + Math.random() * 200),
      unloadingPending: Math.round(250 + Math.random() * 150),
      escalations: Math.round(60 + Math.random() * 40),
    };
  });
}

const dataMap: Record<Period, () => ReturnType<typeof generateWeeklyData>> = {
  week: generateWeeklyData,
  month: generateMonthlyData,
  year: generateYearlyData,
};

const periodLabels: Record<Period, string> = {
  week: 'vs last week',
  month: 'vs last month',
  year: 'vs last year',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-3 text-xs shadow-lg">
      <p className="font-medium text-foreground mb-2">{label || d.label}</p>
      <div className="space-y-1 text-muted-foreground">
        <p>Total Relevant Calls: <span className="text-foreground font-medium">{d.totalRelevantCalls}</span></p>
        <p>Successful Handovers: <span className="font-medium" style={{ color: 'hsl(142, 71%, 45%)' }}>{d.successfulHandovers}</span></p>
        <p>GPS Handover Rate: <span className="font-medium" style={{ color: 'hsl(142, 71%, 45%)' }}>{d.gpsHandoverRate}%</span></p>
        <div className="pt-1 border-t border-border/30 mt-1 space-y-1">
          <p>Arrival Pending: <span className="text-foreground">{d.arrivalPending}</span></p>
          <p>Unloading Pending: <span className="text-foreground">{d.unloadingPending}</span></p>
          <p>Escalations: <span className="text-foreground">{d.escalations}</span></p>
        </div>
      </div>
    </div>
  );
}

export function GPSHandoverSuccessTrend() {
  const [period, setPeriod] = useState<Period>('month');

  const data = useMemo(() => dataMap[period](), [period]);

  const improvement = useMemo(() => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1].gpsHandoverRate;
    const prev = data[data.length - 2].gpsHandoverRate;
    return Math.round((latest - prev) * 10) / 10;
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-foreground">GPS Handover Success Trend</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Successful customer handovers improving over time</p>
          </div>
          <div className="flex items-center gap-3">
            {improvement > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                +{improvement}% ↑ {periodLabels[period]}
              </span>
            )}
            <ToggleGroup
              type="single"
              value={period}
              onValueChange={(v) => v && setPeriod(v as Period)}
              size="sm"
              variant="outline"
              className="bg-muted/40 rounded-md p-0.5"
            >
              <ToggleGroupItem value="week" className="text-xs px-2.5 h-6 rounded">Week</ToggleGroupItem>
              <ToggleGroupItem value="month" className="text-xs px-2.5 h-6 rounded">Month</ToggleGroupItem>
              <ToggleGroupItem value="year" className="text-xs px-2.5 h-6 rounded">Year</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }} />
            GPS Handover Rate %
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradGPS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.3}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.3}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="gpsHandoverRate"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2.5}
                fill="url(#gradGPS)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(142, 71%, 45%)', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          Dialflo is increasing successful GPS handovers through better driver coordination and operational follow-up.
        </p>
      </CardContent>
    </Card>
  );
}
