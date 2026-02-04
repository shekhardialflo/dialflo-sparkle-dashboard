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
import { type Campaign, insightAgents } from '@/data/mockData';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CampaignDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export function CampaignDetailsDrawer({ open, onOpenChange, campaign }: CampaignDetailsDrawerProps) {
  const { toast } = useToast();

  if (!campaign) return null;

  const formatSchedule = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    } catch {
      return '-';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0" side="right">
        <SheetHeader className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>{campaign.name}</SheetTitle>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={getCampaignStatus(campaign.status)}>
                  {campaign.status}
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
                  <span className="font-medium">{campaign.assistantName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">List</span>
                  <span className="font-medium">
                    {campaign.listName} ({campaign.listCount.toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start</span>
                  <span className="font-medium">{formatSchedule(campaign.scheduleStart)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">End</span>
                  <span className="font-medium">{formatSchedule(campaign.scheduleEnd)}</span>
                </div>
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
                    <p className="text-2xl font-semibold">{campaign.attempted.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Connected</p>
                    <p className="text-2xl font-semibold">{campaign.connected.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Answer Rate</span>
                    <span className="font-medium">{campaign.answerRate}%</span>
                  </div>
                  <Progress value={campaign.answerRate} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">{formatDuration(campaign.avgDuration)}</p>
                    <p className="text-xs text-muted-foreground">Avg Duration</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{campaign.conversion}%</p>
                    <p className="text-xs text-muted-foreground">Conversion</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">₹{campaign.totalCost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insight Agent */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Insight Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Insight Agent</Label>
                  <Select defaultValue={campaign.insightAgentId || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {insightAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {campaign.lastInsightRun && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Last run: {campaign.lastInsightRun}
                  </div>
                )}
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
  );
}
