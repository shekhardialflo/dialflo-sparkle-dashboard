import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { RetryQueueItem } from '@/types/retryStrategy';
import { useToast } from '@/hooks/use-toast';

interface RetryQueueDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  queueItems: RetryQueueItem[];
}

// Generate mock retry queue data
function generateMockQueueItems(count: number): RetryQueueItem[] {
  const names = [
    'Rahul Sharma',
    'Priya Patel',
    'Amit Kumar',
    'Sneha Reddy',
    'Vikram Singh',
  ];
  const outcomes = ['Not Answered', 'Voicemail', 'Callback Requested', 'Short Call'];
  const statuses: RetryQueueItem['status'][] = ['queued', 'queued', 'queued', 'paused'];

  return Array.from({ length: Math.min(count, 20) }, (_, i) => {
    const nextAttempt = new Date();
    nextAttempt.setMinutes(nextAttempt.getMinutes() + Math.floor(Math.random() * 120) + 15);

    return {
      id: `rq-${i + 1}`,
      leadName: names[i % names.length],
      phoneNumber: `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      lastOutcome: outcomes[Math.floor(Math.random() * outcomes.length)],
      attemptsSoFar: Math.floor(Math.random() * 2) + 1,
      maxAttempts: 3,
      nextAttemptAt: nextAttempt.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
}

export function RetryQueueDrawer({
  open,
  onOpenChange,
  campaignName,
  queueItems: providedItems,
}: RetryQueueDrawerProps) {
  const { toast } = useToast();

  // Use provided items or generate mock data
  const queueItems = providedItems.length > 0 ? providedItems : generateMockQueueItems(15);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: RetryQueueItem['status']) => {
    switch (status) {
      case 'queued':
        return <StatusBadge status="info">Queued</StatusBadge>;
      case 'running':
        return <StatusBadge status="success">Running</StatusBadge>;
      case 'paused':
        return <StatusBadge status="warning">Paused</StatusBadge>;
      case 'completed':
        return <StatusBadge status="neutral">Completed</StatusBadge>;
      case 'cancelled':
        return <StatusBadge status="neutral">Cancelled</StatusBadge>;
      default:
        return null;
    }
  };

  const handleCancel = (itemId: string) => {
    toast({
      title: 'Retry cancelled',
      description: 'The scheduled retry has been cancelled.',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0" side="right">
        <SheetHeader className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Retry Queue</SheetTitle>
              <p className="mt-1 text-sm text-muted-foreground">{campaignName}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-6">
            {queueItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No retries in queue</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Leads will appear here when retry conditions are met
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Last Outcome</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Next Attempt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.leadName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.phoneNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.lastOutcome}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{item.attemptsSoFar}</span>
                        <span className="text-muted-foreground">/{item.maxAttempts}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTime(item.nextAttemptAt)}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {(item.status === 'queued' || item.status === 'paused') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleCancel(item.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
