import { useState } from 'react';
import { X, Download, Sparkles, Clock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { StatusBadge, getCampaignStatus } from '@/components/ui/status-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CampaignResponse, CampaignStatus } from '@/types/api';
import { useAgents, useAllTaskAgents } from '@/hooks/use-agents';
import { useAudiences } from '@/hooks/use-campaigns';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { RetryStrategySummary } from './RetryStrategySummary';
import { RetryStrategyEditor } from './RetryStrategyEditor';
import { RetryQueueDrawer } from './RetryQueueDrawer';
import { RetryStrategy, defaultRetryStrategy } from '@/types/retryStrategy';

function mapCampaignStatus(status: CampaignStatus): string {
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

interface CampaignDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignResponse | null;
}

export function CampaignDetailsDrawer({ open, onOpenChange, campaign }: CampaignDetailsDrawerProps) {
  const { toast } = useToast();
  const [editStrategyOpen, setEditStrategyOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [localStrategy, setLocalStrategy] = useState<RetryStrategy | null>(null);

  // API hooks for lookups
  const { data: agents = [] } = useAgents();
  const { data: audiences = [] } = useAudiences();
  const { data: taskAgents = [] } = useAllTaskAgents();

  if (!campaign) return null;

  const currentStrategy = localStrategy || defaultRetryStrategy;
  const mappedStatus = mapCampaignStatus(campaign.status);

  // Lookup helpers
  const agentName = agents.find((a) => a.id === campaign.agent_id)?.agent_name || `Agent #${campaign.agent_id}`;
  const audience = audiences.find((a) => a.id === campaign.audience_id);
  const audienceName = audience?.name || (campaign.audience_id ? 'Unknown list' : '-');
  const audienceSize = campaign.size ?? audience?.size ?? null;

  // Performance metrics from call_status_summary
  const summary = campaign.call_status_summary || {};
  const answered = Number(summary['ANSWERED'] || 0);
  const failed = Number(summary['FAILED'] || 0);
  const notAnswered = Number(summary['NOT_ANSWERED'] || 0);
  const lineBusy = Number(summary['LINE_BUSY'] || 0);
  const inProgress = Number(summary['IN_PROGRESS'] || 0);
  const queued = Number(summary['QUEUED'] || 0);
  const attempted = answered + failed + notAnswered + lineBusy + inProgress + queued;
  const answerRate = attempted > 0 ? Math.round((answered / attempted) * 1000) / 10 : 0;

  const formatSchedule = (dateStr: string | null) => {
    try {
      if (!dateStr) return '-';
      return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    } catch {
      return '-';
    }
  };

  const handleDownload = () => {
    toast({
      title: 'Download started',
      description: 'Your results file is being prepared.',
    });
  };

  const handleGenerateInsights = () => {
    toast({
      title: 'Insights generation started',
      description: 'This may take a few minutes.',
    });
  };

  const handleEditStrategy = () => {
    setLocalStrategy(currentStrategy);
    setEditStrategyOpen(true);
  };

  const handleSaveStrategy = () => {
    toast({
      title: 'Strategy updated',
      description: 'Retry strategy has been saved.',
    });
    setEditStrategyOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl p-0" side="right">
          <SheetHeader className="border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>{campaign.campaign_name}</SheetTitle>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={getCampaignStatus(mappedStatus)}>
                    {mappedStatus}
                  </StatusBadge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assistant</span>
                    <span className="font-medium">{agentName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">List</span>
                    <span className="font-medium">
                      {audienceName}
                      {audienceSize != null && ` (${audienceSize.toLocaleString()})`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Scheduled Start</span>
                    <span className="font-medium">{formatSchedule(campaign.scheduled_start_time)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual Start</span>
                    <span className="font-medium">{formatSchedule(campaign.start_time)}</span>
                  </div>
                  {campaign.paused_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paused At</span>
                      <span className="font-medium">{formatSchedule(campaign.paused_at)}</span>
                    </div>
                  )}
                  {campaign.cancelled_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cancelled At</span>
                      <span className="font-medium">{formatSchedule(campaign.cancelled_at)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">Attempted</p>
                      <p className="text-2xl font-semibold">{attempted.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">Connected</p>
                      <p className="text-2xl font-semibold">{answered.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Answer Rate</span>
                      <span className="font-medium">{answerRate}%</span>
                    </div>
                    <Progress value={answerRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">{failed.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{notAnswered.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Not Answered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Retry Strategy */}
              <RetryStrategySummary
                strategy={currentStrategy}
                onEdit={handleEditStrategy}
                onViewQueue={() => setQueueOpen(true)}
              />

              {/* Insight Agent */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Insight Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Insight Agent</Label>
                    <Select defaultValue="none">
                      <SelectTrigger>
                        <SelectValue placeholder="Choose agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {taskAgents.map((agent) => (
                          <SelectItem key={agent.id} value={String(agent.id)}>
                            {agent.agent_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Results
              </Button>
              <Button className="flex-1" onClick={handleGenerateInsights}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Strategy Dialog */}
      <Dialog open={editStrategyOpen} onOpenChange={setEditStrategyOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Retry Strategy</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {localStrategy && (
              <RetryStrategyEditor
                value={localStrategy}
                onChange={setLocalStrategy}
                campaignDispositions={[]}
                compact
              />
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditStrategyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStrategy}>Save Strategy</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Retry Queue Drawer */}
      <RetryQueueDrawer
        open={queueOpen}
        onOpenChange={setQueueOpen}
        campaignName={campaign.campaign_name}
        queueItems={[]}
      />
    </>
  );
}
