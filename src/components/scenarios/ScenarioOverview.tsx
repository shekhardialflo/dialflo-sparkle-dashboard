import { BarChart3, Layers, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Scenario } from '@/data/scenarioMockData';

interface ScenarioOverviewProps {
  scenarios: Scenario[];
  onViewScenario: (scenario: Scenario) => void;
}

export function ScenarioOverview({ scenarios, onViewScenario }: ScenarioOverviewProps) {
  const totalCalls = scenarios.reduce((sum, s) => sum + s.callCount, 0);
  const totalEdgeCases = scenarios.reduce((sum, s) => sum + s.edgeCases.length, 0);

  const outcomeColors: Record<string, string> = {
    'Resolved': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'Refund Initiated': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'Appointment Booked': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    'Issue Resolved': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'Complaint Logged': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <BarChart3 className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCalls}</p>
              <p className="text-xs text-muted-foreground">Total Calls</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <Layers className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{scenarios.length}</p>
              <p className="text-xs text-muted-foreground">Scenarios Found</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalEdgeCases}</p>
              <p className="text-xs text-muted-foreground">Edge Cases Detected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="transition-colors hover:bg-muted/20">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-foreground leading-snug">{scenario.name}</h3>
                <Badge variant="outline" className="shrink-0 text-[10px] font-medium">
                  {scenario.confidence}% match
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{scenario.callCount} calls</span>
                <span>—</span>
                <span>{scenario.percentage}%</span>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Goal</span>
                  <p className="text-xs text-foreground">{scenario.goal}</p>
                </div>
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Trigger</span>
                  <p className="text-xs text-foreground">{scenario.trigger}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Top Patterns</span>
                <ul className="space-y-0.5">
                  {scenario.patterns.map((p, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${outcomeColors[scenario.commonOutcome] || 'bg-muted text-muted-foreground'}`}>
                  {scenario.commonOutcome}
                </span>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onViewScenario(scenario)}>
                  View Scenario →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
