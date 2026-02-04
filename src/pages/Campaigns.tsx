import { useState } from 'react';
import { Plus, MoreVertical, Pause, Play, Download, Trash2, Eye, Upload } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, getCampaignStatus } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
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
import { campaigns, contactLists, type Campaign, type ContactList } from '@/data/mockData';
import { CreateCampaignModal } from '@/components/campaigns/CreateCampaignModal';
import { CampaignDetailsDrawer } from '@/components/campaigns/CampaignDetailsDrawer';
import { CreateListModal } from '@/components/campaigns/CreateListModal';
import { format } from 'date-fns';

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createListOpen, setCreateListOpen] = useState(false);

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLists = contactLists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailsOpen(true);
  };

  const formatSchedule = (start: string, end: string) => {
    try {
      return `${format(new Date(start), 'MMM d')} - ${format(new Date(end), 'MMM d, yyyy')}`;
    } catch {
      return '-';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                {filteredCampaigns.map((campaign) => (
                  <TableRow
                    key={campaign.id}
                    className="cursor-pointer"
                    onClick={() => handleViewDetails(campaign)}
                  >
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.assistantName}</TableCell>
                    <TableCell>
                      <div>
                        <span>{campaign.listName}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({campaign.listCount.toLocaleString()})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatSchedule(campaign.scheduleStart, campaign.scheduleEnd)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={getCampaignStatus(campaign.status)}>
                        {campaign.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Attempted: {campaign.attempted.toLocaleString()}</div>
                        <div className="text-muted-foreground">
                          Answer: {campaign.answerRate}% • Conv: {campaign.conversion}%
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
                          {campaign.status === 'running' ? (
                            <DropdownMenuItem>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause campaign
                            </DropdownMenuItem>
                          ) : campaign.status === 'paused' ? (
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Resume campaign
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download results
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="lists">
          <div className="mb-4 flex justify-end">
            <Button variant="outline" onClick={() => setCreateListOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Create List
            </Button>
          </div>
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
                        {list.tags && list.tags.length > 0 && (
                          <div className="mt-1 flex gap-1">
                            {list.tags.map((tag) => (
                              <StatusBadge key={tag} status="neutral">
                                {tag}
                              </StatusBadge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{list.records.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{list.updatedAt}</TableCell>
                    <TableCell>
                      <StatusBadge status="neutral">{list.source.toUpperCase()}</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
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
