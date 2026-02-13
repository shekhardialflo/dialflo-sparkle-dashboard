import { useState } from 'react';
import { Plus, MoreVertical, Pause, Play, Download, Trash2, Eye, Upload, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { StatusBadge, getCampaignStatus } from '@/components/ui/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useCampaigns,
  useAudiences,
  usePauseCampaign,
  useResumeCampaign,
  useDeleteCampaign,
  useDeleteAudience,
} from '@/hooks/use-campaigns';
import { useAgents } from '@/hooks/use-agents';
import type { CampaignResponse, CampaignStatus, AudienceResponse } from '@/types/api';
import { CreateCampaignModal } from '@/components/campaigns/CreateCampaignModal';
import { CampaignDetailsDrawer } from '@/components/campaigns/CampaignDetailsDrawer';
import { CreateListModal } from '@/components/campaigns/CreateListModal';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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

export default function Campaigns() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createListOpen, setCreateListOpen] = useState(false);

  // API hooks
  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError } = useCampaigns();
  const { data: audiences = [], isLoading: audiencesLoading } = useAudiences();
  const { data: agents = [] } = useAgents();
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();
  const deleteCampaign = useDeleteCampaign();
  const deleteAudience = useDeleteAudience();

  // Lookup helpers
  const getAgentName = (agentId: number) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent?.agent_name || `Agent #${agentId}`;
  };

  const getAudienceName = (audienceId: string | null) => {
    if (!audienceId) return '-';
    const audience = audiences.find((a) => a.id === audienceId);
    return audience?.name || 'Unknown list';
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLists = audiences.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (campaign: CampaignResponse) => {
    setSelectedCampaign(campaign);
    setDetailsOpen(true);
  };

  const formatSchedule = (campaign: CampaignResponse) => {
    try {
      const dateStr = campaign.scheduled_start_time || campaign.start_time;
      if (!dateStr) return '-';
      return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    } catch {
      return '-';
    }
  };

  const getMetrics = (campaign: CampaignResponse) => {
    const summary = campaign.call_status_summary || {};
    const answered = Number(summary['ANSWERED'] || 0);
    const failed = Number(summary['FAILED'] || 0);
    const notAnswered = Number(summary['NOT_ANSWERED'] || 0);
    const lineBusy = Number(summary['LINE_BUSY'] || 0);
    const inProgress = Number(summary['IN_PROGRESS'] || 0);
    const queued = Number(summary['QUEUED'] || 0);
    const attempted = answered + failed + notAnswered + lineBusy + inProgress + queued;
    const answerRate = attempted > 0 ? Math.round((answered / attempted) * 1000) / 10 : 0;
    return { attempted, answered, answerRate };
  };

  const handlePause = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    pauseCampaign.mutate(campaignId, {
      onSuccess: () => toast({ title: 'Campaign paused' }),
      onError: () => toast({ title: 'Failed to pause campaign', variant: 'destructive' }),
    });
  };

  const handleResume = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    resumeCampaign.mutate(campaignId, {
      onSuccess: () => toast({ title: 'Campaign resumed' }),
      onError: () => toast({ title: 'Failed to resume campaign', variant: 'destructive' }),
    });
  };

  const handleDeleteCampaign = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    deleteCampaign.mutate(campaignId, {
      onSuccess: () => toast({ title: 'Campaign deleted' }),
      onError: () => toast({ title: 'Failed to delete campaign', variant: 'destructive' }),
    });
  };

  const handleDeleteAudience = (audienceId: string) => {
    deleteAudience.mutate(audienceId, {
      onSuccess: () => toast({ title: 'List deleted' }),
      onError: () => toast({ title: 'Failed to delete list', variant: 'destructive' }),
    });
  };

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Launch and monitor calling campaigns"
        actions={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
          </TabsList>
          <SearchInput
            placeholder={activeTab === 'campaigns' ? 'Search campaigns...' : 'Search lists...'}
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:max-w-xs"
          />
        </div>

        <TabsContent value="campaigns">
          {campaignsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : campaignsError ? (
            <div className="py-12 text-center text-muted-foreground">
              Failed to load campaigns. Please try again.
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchQuery ? 'No campaigns match your search.' : 'No campaigns yet. Create your first campaign to get started.'}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Assistant</TableHead>
                    <TableHead>List</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metrics</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const mappedStatus = mapCampaignStatus(campaign.status);
                    const metrics = getMetrics(campaign);
                    return (
                      <TableRow
                        key={campaign.campaign_id}
                        className="cursor-pointer hover:bg-muted/20"
                        onClick={() => handleViewDetails(campaign)}
                      >
                        <TableCell className="font-medium text-foreground">
                          {campaign.campaign_name}
                        </TableCell>
                        <TableCell>{getAgentName(campaign.agent_id)}</TableCell>
                        <TableCell>
                          <div>
                            <span>{getAudienceName(campaign.audience_id)}</span>
                            {campaign.size != null && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({campaign.size.toLocaleString()})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatSchedule(campaign)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getCampaignStatus(mappedStatus)}>
                            {mappedStatus}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-semibold text-foreground">
                              {metrics.attempted.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-muted-foreground/70">
                              Answer: {metrics.answerRate}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(campaign)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              {mappedStatus === 'running' ? (
                                <DropdownMenuItem
                                  onClick={(e) => handlePause(e, campaign.campaign_id)}
                                >
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause campaign
                                </DropdownMenuItem>
                              ) : mappedStatus === 'paused' ? (
                                <DropdownMenuItem
                                  onClick={(e) => handleResume(e, campaign.campaign_id)}
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Resume campaign
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download results
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => handleDeleteCampaign(e, campaign.campaign_id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lists">
          <div className="mb-4 flex justify-end">
            <Button variant="outline" onClick={() => setCreateListOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Create List
            </Button>
          </div>
          {audiencesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLists.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchQuery ? 'No lists match your search.' : 'No lists yet. Create your first list to get started.'}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>List Name</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{list.name}</span>
                          {list.description && (
                            <p className="mt-1 text-xs text-muted-foreground">{list.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{list.size != null ? list.size.toLocaleString() : '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {(() => {
                          try {
                            return format(new Date(list.updated_at), 'MMM d, yyyy');
                          } catch {
                            return '-';
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="neutral">
                          {list.file_url ? 'CSV' : 'API'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteAudience(list.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateCampaignModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <CampaignDetailsDrawer
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        campaign={selectedCampaign}
      />
      <CreateListModal open={createListOpen} onOpenChange={setCreateListOpen} />
    </div>
  );
}
