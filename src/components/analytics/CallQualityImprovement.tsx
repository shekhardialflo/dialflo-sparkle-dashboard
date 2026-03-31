import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

type Period = 'week' | 'month' | 'year';

// --- Mock data generators ---
function generateWeeklyData() {
  const data = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const base = 52 + i * 0.8;
    data.push({
      label: `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      positiveOutcome: Math.min(100, Math.round(base + Math.random() * 8 + (12 - i) * 2.5)),
      detailsCaptured: Math.min(100, Math.round(base - 8 + Math.random() * 6 + (12 - i) * 1.8)),
      totalCalls: Math.round(120 + Math.random() * 80),
      nameCaptured: Math.round(70 + Math.random() * 20 + (12 - i) * 1.2),
      requirementCaptured: Math.round(55 + Math.random() * 15 + (12 - i) * 2),
      budgetCaptured: Math.round(40 + Math.random() * 10 + (12 - i) * 2.5),
    });
  }
  return data;
}

function generateMonthlyData() {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  return months.map((m, i) => ({
    label: m,
    positiveOutcome: Math.min(100, Math.round(45 + i * 5 + Math.random() * 6)),
    detailsCaptured: Math.min(100, Math.round(38 + i * 4.5 + Math.random() * 5)),
    totalCalls: Math.round(400 + Math.random() * 300 + i * 50),
    nameCaptured: Math.round(60 + i * 3 + Math.random() * 8),
    requirementCaptured: Math.round(50 + i * 4 + Math.random() * 6),
    budgetCaptured: Math.round(35 + i * 5 + Math.random() * 5),
  }));
}

function generateYearlyData() {
  return ['2022', '2023', '2024', '2025', '2026'].map((y, i) => ({
    label: y,
    positiveOutcome: Math.min(100, Math.round(35 + i * 14 + Math.random() * 4)),
    detailsCaptured: Math.min(100, Math.round(28 + i * 13 + Math.random() * 4)),
    totalCalls: Math.round(2000 + i * 1500 + Math.random() * 500),
    nameCaptured: Math.round(50 + i * 8 + Math.random() * 5),
    requirementCaptured: Math.round(40 + i * 10 + Math.random() * 5),
    budgetCaptured: Math.round(25 + i * 12 + Math.random() * 5),
  }));
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
        <p>Total Calls: <span className="text-foreground font-medium">{d.totalCalls}</span></p>
        <p>Positive Outcomes: <span className="font-medium" style={{ color: 'hsl(142, 71%, 45%)' }}>{d.positiveOutcome}%</span></p>
        <p className="pt-1 border-t border-border/30 mt-1 font-medium text-foreground">Details Captured:</p>
        <p>Name captured: <span className="text-foreground">{d.nameCaptured}%</span></p>
        <p>Requirement captured: <span className="text-foreground">{d.requirementCaptured}%</span></p>
        <p>Budget captured: <span className="text-foreground">{d.budgetCaptured}%</span></p>
      </div>
    </div>
  );
}

export function CallQualityImprovement() {
  const [period, setPeriod] = useState<Period>('month');

  const data = useMemo(() => dataMap[period](), [period]);

  // Calculate improvement %
  const improvement = useMemo(() => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1].positiveOutcome;
    const prev = data[data.length - 2].positiveOutcome;
    return latest - prev;
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-foreground">Call Quality Improvement</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Positive outcomes improving over time</p>
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
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }} />
            Positive Outcome %
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 border-t border-dashed" style={{ borderColor: 'hsl(217, 91%, 60%)' }} />
            Details Captured %
          </div>
        </div>

        {/* Chart */}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradPositive" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="positiveOutcome"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2.5}
                fill="url(#gradPositive)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(142, 71%, 45%)', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="detailsCaptured"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                strokeOpacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer insight */}
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          Dialflo has improved your positive call outcomes through better conversation quality and structured data capture.
        </p>
      </CardContent>
    </Card>
  );
}
