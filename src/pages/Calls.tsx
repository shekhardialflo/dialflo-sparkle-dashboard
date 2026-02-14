import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Settings2, Calendar, X, Play, RefreshCw, FileJson, Volume2, FileText, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge, getCallStatus } from '@/components/ui/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCallInsights } from '@/hooks/use-calls';
import { useAgents } from '@/hooks/use-agents';
import { useCampaigns } from '@/hooks/use-campaigns';
import type { CallInsightWithStatsResponse, CallAgentResponse } from '@/types/api';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// ----- Display types & helpers -----

interface DisplayCall {
  id: string;
  calledAt: string;
  calleeName: string;
  calleePhone: string;
  assistantId: string;
  assistantName: string;
  status: string;
  direction: string;
  duration: number;
  cost: number;
  disposition: string;
  transcript?: string;
  recordingUrl?: string | null;
  extractedFields?: Record<string, string | number | boolean>;
  callSummary?: string | null;
  campaignName?: string;
}

function mapCallOutcome(call: CallInsightWithStatsResponse): string {
  if (call.call_duration && call.call_duration > 0) return 'connected';
  return 'not_answered';
}

function formatTranscription(transcription: Record<string, unknown>[] | undefined | null): string | undefined {
  if (!transcription || transcription.length === 0) return undefined;
  return transcription
    .map((t) => {
      const role = (t.role as string) || 'Unknown';
      const content = (t.content as string) || (t.text as string) || '';
      return `${role}: ${content}`;
    })
    .join('\n');
}

function getCallDisplayInfo(call: CallInsightWithStatsResponse, agents: CallAgentResponse[]): DisplayCall {
  const agent = agents.find((a) => a.id === call.agent_id);
  return {
    id: call.call_id || String(call.id),
    calledAt: call.created_at,
    calleeName: call.user_number || call.to_number || call.from_number || 'Unknown',
    calleePhone: call.user_number || call.to_number || call.from_number || '',
    assistantId: String(call.agent_id || ''),
    assistantName: agent?.agent_name || 'Unknown Agent',
    status: mapCallOutcome(call),
    direction: (call.direction || 'outbound').toLowerCase(),
    duration: call.call_duration || 0,
    cost: 0,
    disposition: call.call_disposition || 'Unknown',
    transcript: formatTranscription(call.call_transcription),
    recordingUrl: call.recording_url,
    extractedFields: call.insights_data as Record<string, string | number | boolean> | undefined,
    callSummary: call.call_summary,
  };
}

// ----- Constants -----

const dispositions = [
  'Interested',
  'Not Interested',
  'Callback Requested',
  'Wrong Number',
  'Appointment Set',
  'Information Sent',
  'Qualified',
  'Unqualified',
  'Do Not Call',
];

const allColumns = [
  { id: 'calledAt', label: 'Called At', default: true },
  { id: 'callee', label: 'Callee', default: true },
  { id: 'assistant', label: 'Agent', default: true },
  { id: 'campaign', label: 'Campaign', default: true },
  { id: 'status', label: 'Status', default: true },
  { id: 'duration', label: 'Duration', default: true },
  { id: 'cost', label: 'Cost', default: false },
  { id: 'disposition', label: 'Disposition', default: true },
];

// ----- Main Component -----

export default function Calls() {
  const [searchParams] = useSearchParams();
  const initialAssistant = searchParams.get('assistant') || 'all';

  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantFilter, setAssistantFilter] = useState(initialAssistant);
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [dispositionFilter, setDispositionFilter] = useState('all');
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.filter((c) => c.default).map((c) => c.id)
  );
  const [selectedCall, setSelectedCall] = useState<DisplayCall | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 25;

  // ----- API hooks -----
  const { data: insightsData, isLoading, error } = useCallInsights({
    limit,
    offset: page * limit,
    agent_ids: assistantFilter !== 'all' ? assistantFilter : undefined,
  });
  const { data: agents = [] } = useAgents();
  const { data: campaignsData = [] } = useCampaigns();

  const callRecords = insightsData?.data || [];
  const totalRecords = insightsData?.meta?.total || 0;
  const hasNext = insightsData?.meta?.has_next || false;
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

  // ----- Map API data to display data -----
  const displayCalls = callRecords.map((call) => getCallDisplayInfo(call, agents));

  // ----- Client-side filtering (for filters not handled by the API) -----
  const filteredCalls = displayCalls.filter((call) => {
    const matchesSearch =
      call.calleeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.calleePhone.includes(searchQuery) ||
      call.id.includes(searchQuery);
    const matchesCampaign = campaignFilter === 'all' || true; // Campaign filtering not directly available on insights
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesDirection = directionFilter === 'all' || call.direction === directionFilter;
    const matchesDisposition = dispositionFilter === 'all' || call.disposition === dispositionFilter;
    return matchesSearch && matchesCampaign && matchesStatus && matchesDirection && matchesDisposition;
  });

  const handleViewDetails = (call: DisplayCall) => {
    setSelectedCall(call);
    setDetailsOpen(true);
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, h:mm a');
    } catch {
      return '-';
    }
  };

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnId) ? prev.filter((c) => c !== columnId) : [...prev, columnId]
    );
  };

  const handleExport = () => {
    toast({
      title: 'Export started',
      description: 'Your calls export is being prepared.',
    });
  };

  // Reset to page 0 when filters change
  const handleAssistantFilterChange = (value: string) => {
    setAssistantFilter(value);
    setPage(0);
  };

  return (
    <div>
      <PageHeader
        title="Calls"
        subtitle="Search and review individual calls"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Last 7 days
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-4">
        <SearchInput
          placeholder="Search by phone/name/call id..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-md"
        />

        {/* Filter pills row */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={assistantFilter} onValueChange={handleAssistantFilterChange}>
            <SelectTrigger className="h-8 w-auto min-w-[120px] rounded-pill text-xs">
              <SelectValue placeholder="All Assistants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={String(agent.id)}>
                  {agent.agent_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="h-8 w-auto min-w-[120px] rounded-pill text-xs">
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaignsData.map((campaign) => (
                <SelectItem key={campaign.campaign_id} value={campaign.campaign_id}>
                  {campaign.campaign_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-auto min-w-[100px] rounded-pill text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="voicemail">Voicemail</SelectItem>
              <SelectItem value="not_answered">Not Answered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="h-8 w-auto min-w-[90px] rounded-pill text-xs">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dispositionFilter} onValueChange={setDispositionFilter}>
            <SelectTrigger className="h-8 w-auto min-w-[120px] rounded-pill text-xs">
              <SelectValue placeholder="Disposition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dispositions</SelectItem>
              {dispositions.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-pill">
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <p className="text-sm font-medium">Visible Columns</p>
                {allColumns.map((col) => (
                  <div key={col.id} className="flex items-center gap-2">
                    <Checkbox
                      id={col.id}
                      checked={visibleColumns.includes(col.id)}
                      onCheckedChange={() => toggleColumn(col.id)}
                    />
                    <label htmlFor={col.id} className="text-sm cursor-pointer">
                      {col.label}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading calls...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-destructive">Failed to load calls. Please try again.</p>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No calls found</p>
            <p className="text-xs text-muted-foreground/70">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.includes('calledAt') && <TableHead>Called At</TableHead>}
                {visibleColumns.includes('callee') && <TableHead>Callee</TableHead>}
                {visibleColumns.includes('assistant') && <TableHead>Agent</TableHead>}
                {visibleColumns.includes('campaign') && <TableHead>Campaign</TableHead>}
                {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                {visibleColumns.includes('duration') && <TableHead>Duration</TableHead>}
                {visibleColumns.includes('cost') && <TableHead>Cost</TableHead>}
                {visibleColumns.includes('disposition') && <TableHead>Disposition</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalls.map((call) => (
                <TableRow
                  key={call.id}
                  className="cursor-pointer"
                  onClick={() => handleViewDetails(call)}
                >
                  {visibleColumns.includes('calledAt') && (
                    <TableCell className="text-sm">{formatDateTime(call.calledAt)}</TableCell>
                  )}
                  {visibleColumns.includes('callee') && (
                    <TableCell>
                      <div>
                        <span className="font-medium text-foreground">{call.calleeName}</span>
                        <p className="text-[11px] text-muted-foreground/70">{call.calleePhone}</p>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('assistant') && (
                    <TableCell>{call.assistantName}</TableCell>
                  )}
                  {visibleColumns.includes('campaign') && (
                    <TableCell className="text-muted-foreground">
                      {call.campaignName || '-'}
                    </TableCell>
                  )}
                  {visibleColumns.includes('status') && (
                    <TableCell>
                      <StatusBadge status={getCallStatus(call.status)}>
                        {call.status.replace('_', ' ')}
                      </StatusBadge>
                    </TableCell>
                  )}
                  {visibleColumns.includes('duration') && (
                    <TableCell className="text-sm">{formatDuration(call.duration)}</TableCell>
                  )}
                  {visibleColumns.includes('cost') && (
                    <TableCell className="text-sm">
                      {call.cost > 0 ? `₹${call.cost.toFixed(2)}` : '-'}
                    </TableCell>
                  )}
                  {visibleColumns.includes('disposition') && (
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {call.disposition}
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Pagination */}
      {!isLoading && !error && totalRecords > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * limit + 1}–{Math.min((page + 1) * limit, totalRecords)} of {totalRecords} calls
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CallDetailsDrawer
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        call={selectedCall}
      />
    </div>
  );
}

// ----- Call Details Drawer -----

interface CallDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  call: DisplayCall | null;
}

function CallDetailsDrawer({ open, onOpenChange, call }: CallDetailsDrawerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('transcript');

  if (!call) return null;

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy h:mm a');
    } catch {
      return '-';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getConfidenceLevel = () => {
    // Placeholder confidence for disposition
    const confidence = Math.floor(Math.random() * 30 + 70);
    return confidence;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0" side="right">
        <SheetHeader className="border-b border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg">{call.calleeName}</SheetTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">{call.calleePhone} · {call.id}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-160px)]">
          <div className="p-5 space-y-5">
            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={getCallStatus(call.status)} className="mt-1">
                  {call.status.replace('_', ' ')}
                </StatusBadge>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="mt-1 text-sm font-medium">{formatDuration(call.duration)}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="mt-1 text-sm font-medium">{call.cost > 0 ? `₹${call.cost.toFixed(2)}` : '-'}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Called At</p>
                <p className="mt-1 text-xs font-medium">{formatDateTime(call.calledAt)}</p>
              </div>
            </div>

            {/* Assistant & Campaign */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Assistant</span>
                <span className="font-medium">{call.assistantName}</span>
              </div>
              {call.campaignName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Campaign</span>
                  <span className="font-medium">{call.campaignName}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Disposition */}
            <div className="rounded-lg border border-border/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Disposition</p>
                  <p className="mt-1 text-sm font-semibold">{call.disposition}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="mt-1 text-sm font-medium text-primary">{getConfidenceLevel()}%</p>
                </div>
              </div>
            </div>

            {/* Call Summary */}
            {call.callSummary && (
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Call Summary</p>
                <p className="text-sm leading-relaxed">{call.callSummary}</p>
              </div>
            )}

            {/* Extracted Fields (if insight agent ran) */}
            {call.extractedFields && Object.keys(call.extractedFields).length > 0 && (
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">Extracted Fields</p>
                <div className="space-y-2">
                  {Object.entries(call.extractedFields).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Transcript & Audio Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="transcript" className="text-xs">
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Transcript
                </TabsTrigger>
                <TabsTrigger value="audio" className="text-xs">
                  <Volume2 className="mr-1.5 h-3.5 w-3.5" />
                  Audio
                </TabsTrigger>
              </TabsList>
              <TabsContent value="transcript" className="mt-3">
                {call.transcript ? (
                  <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                    {call.transcript}
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted/50 p-6 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No transcript available</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="audio" className="mt-3">
                {call.recordingUrl ? (
                  <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                    <audio controls className="w-full" src={call.recordingUrl}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : call.status === 'connected' ? (
                  <div className="rounded-lg bg-muted/50 p-6 text-center">
                    <Play className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">Audio player placeholder</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Play className="mr-1.5 h-3 w-3" />
                      Play Recording
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted/50 p-6 text-center">
                    <Volume2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No recording available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                toast({
                  title: 'Re-running insights',
                  description: 'This may take a moment.',
                });
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-run Insights
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                toast({
                  title: 'Downloaded',
                  description: 'Call data exported as JSON.',
                });
              }}
            >
              <FileJson className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
