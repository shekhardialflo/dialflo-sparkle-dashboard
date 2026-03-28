import { useState } from 'react';
import { ArrowLeft, Download, GitBranch, List, MessageSquare, Tag, AlertTriangle, Target, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Scenario, ScenarioFlowNode } from '@/data/scenarioMockData';

interface ScenarioDetailProps {
  scenario: Scenario;
  onBack: () => void;
}

function FlowchartView({ nodes }: { nodes: ScenarioFlowNode[] }) {
  const nodeColors: Record<string, string> = {
    question: 'border-blue-500/40 bg-blue-500/5',
    condition: 'border-amber-500/40 bg-amber-500/5',
    action: 'border-secondary/40 bg-secondary/5',
    end: 'border-muted-foreground/30 bg-muted/30',
  };

  const nodeIcons: Record<string, string> = {
    question: '❓',
    condition: '⚡',
    action: '▶',
    end: '⏹',
  };

  return (
    <div className="space-y-3">
      {nodes.map((node, idx) => (
        <div key={node.id} className="flex flex-col items-center">
          <div
            className={cn(
              'w-full max-w-md rounded-lg border-2 px-4 py-3 text-center text-sm',
              nodeColors[node.type]
            )}
          >
            <span className="mr-2">{nodeIcons[node.type]}</span>
            <span className="font-medium text-foreground">{node.label}</span>
          </div>
          {node.branches && node.branches.length > 0 && idx < nodes.length - 1 && (
            <div className="flex items-center gap-6 py-2">
              {node.branches.map((branch, bi) => (
                <div key={bi} className="flex flex-col items-center">
                  <div className="h-4 w-px bg-border" />
                  {branch.label && (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      {branch.label}
                    </span>
                  )}
                  <div className="h-4 w-px bg-border" />
                </div>
              ))}
            </div>
          )}
          {!node.branches && idx < nodes.length - 1 && (
            <div className="h-6 w-px bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}

function StepListView({ nodes }: { nodes: ScenarioFlowNode[] }) {
  return (
    <div className="space-y-2">
      {nodes.map((node, idx) => (
        <div key={node.id} className="flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-xs font-semibold text-secondary">
            {idx + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{node.label}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{node.type}</p>
            {node.branches && node.branches.filter(b => b.label).length > 0 && (
              <div className="mt-1 flex gap-1.5">
                {node.branches.filter(b => b.label).map((b, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">{b.label}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScenarioDetail({ scenario, onBack }: ScenarioDetailProps) {
  const [flowView, setFlowView] = useState<'flowchart' | 'steps'>('flowchart');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{scenario.name}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{scenario.callCount} calls</span>
              <span>·</span>
              <span>{scenario.percentage}% share</span>
              <Badge variant="outline" className="text-[10px]">{scenario.confidence}% confidence</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {/* Goal & Trigger */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Goal
            </h4>
            <p className="text-sm text-foreground"><strong>Business:</strong> {scenario.goalDetail.business}</p>
            <p className="text-sm text-foreground"><strong>Agent Task:</strong> {scenario.goalDetail.agentTask}</p>
            <p className="text-sm text-foreground"><strong>Expected:</strong> {scenario.goalDetail.expectedOutcome}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trigger</h4>
            <p className="text-sm text-foreground">{scenario.triggerDetail}</p>
          </CardContent>
        </Card>
      </div>

      {/* Flow */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <GitBranch className="h-4 w-4 text-secondary" /> Conversation Flow
            </h4>
            <div className="flex rounded-lg border p-0.5">
              <Button
                variant={flowView === 'flowchart' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFlowView('flowchart')}
              >
                <GitBranch className="mr-1 h-3 w-3" /> Flowchart
              </Button>
              <Button
                variant={flowView === 'steps' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFlowView('steps')}
              >
                <List className="mr-1 h-3 w-3" /> Steps
              </Button>
            </div>
          </div>
          {flowView === 'flowchart' ? (
            <FlowchartView nodes={scenario.flow} />
          ) : (
            <StepListView nodes={scenario.flow} />
          )}
        </CardContent>
      </Card>

      {/* Tabbed sections */}
      <Tabs defaultValue="utterances">
        <TabsList>
          <TabsTrigger value="utterances">
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Utterances
          </TabsTrigger>
          <TabsTrigger value="captured">
            <Tag className="mr-1.5 h-3.5 w-3.5" /> Info Captured
          </TabsTrigger>
          <TabsTrigger value="edge-cases">
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Edge Cases
          </TabsTrigger>
          <TabsTrigger value="outcomes">
            <Target className="mr-1.5 h-3.5 w-3.5" /> Outcomes
          </TabsTrigger>
          <TabsTrigger value="calls">
            <Phone className="mr-1.5 h-3.5 w-3.5" /> Calls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="utterances" className="space-y-4 mt-4">
          {scenario.utterances.map((u) => (
            <div key={u.step} className="space-y-1.5">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{u.step}</h5>
              <div className="space-y-1">
                {u.lines.map((line, i) => (
                  <div key={i} className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground italic">
                    "{line}"
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="captured" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {scenario.informationCaptured.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="edge-cases" className="space-y-3 mt-4">
          {scenario.edgeCases.map((ec) => (
            <Card key={ec.title} className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-foreground">{ec.title}</h5>
                    <p className="text-xs text-muted-foreground mt-1 italic">"{ec.example}"</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{ec.frequency}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="outcomes" className="mt-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {scenario.outcomes.map((outcome) => (
              <div key={outcome} className="flex items-center gap-2 rounded-lg bg-muted/30 px-4 py-3">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <span className="text-sm text-foreground">{outcome}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calls" className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Call ID</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                  <TableHead className="text-xs">Language</TableHead>
                  <TableHead className="text-xs">Outcome</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenario.representativeCalls.map((call) => (
                  <TableRow key={call.callId}>
                    <TableCell className="text-xs font-mono">{call.callId}</TableCell>
                    <TableCell className="text-xs">{call.duration}</TableCell>
                    <TableCell className="text-xs">{call.language}</TableCell>
                    <TableCell className="text-xs">{call.outcome}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[10px] h-6">
                        View Transcript
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
