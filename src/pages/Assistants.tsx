import { useState } from 'react';
import { Plus, Grid3X3, List, MoreVertical, Play, Copy, History, BarChart3, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { voiceAgents, insightAgents, type VoiceAgent, type InsightAgent } from '@/data/mockData';
import { CreateAssistantModal } from '@/components/assistants/CreateAssistantModal';
import { AssistantDetailsDrawer } from '@/components/assistants/AssistantDetailsDrawer';
import { TestCallModal } from '@/components/assistants/TestCallModal';
import { cn } from '@/lib/utils';

// Helper to generate activity cue based on call count and update time
function getActivityCue(callCount: number, updatedAt: string): { text: string; type: 'active' | 'inactive' | 'review' } {
  // Parse the updatedAt string for basic logic
  const isRecent = updatedAt.includes('min') || updatedAt.includes('hour');
  const hasRecentCalls = callCount > 500;
  
  if (hasRecentCalls && isRecent) {
    return { text: 'Active', type: 'active' };
  } else if (callCount < 100) {
    return { text: 'No recent calls', type: 'inactive' };
  } else if (updatedAt.includes('day') || updatedAt.includes('week')) {
    return { text: 'Needs review', type: 'review' };
  }
  return { text: 'Active', type: 'active' };
}

export default function Assistants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('voice');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgent | InsightAgent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [testCallOpen, setTestCallOpen] = useState(false);
  const [testCallAgent, setTestCallAgent] = useState<VoiceAgent | null>(null);

  const filteredVoiceAgents = voiceAgents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || typeFilter === 'voice';
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'calls') return b.callCount - a.callCount;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // Default: recently updated (keep original order)
  });

  const filteredInsightAgents = insightAgents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || typeFilter === 'insight';
    return matchesSearch && matchesType;
  });

  const handleTestCall = (agent: VoiceAgent) => {
    setTestCallAgent(agent);
    setTestCallOpen(true);
  };

  const handleViewDetails = (agent: VoiceAgent | InsightAgent) => {
    setSelectedAgent(agent);
    setDetailsOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Assistants"
        subtitle="Manage your voice assistants"
        actions={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assistant
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search assistants..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:max-w-xs"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="insight">Insight</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="calls">Most Calls</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Toggle
            pressed={viewMode === 'grid'}
            onPressedChange={() => setViewMode('grid')}
            size="sm"
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === 'list'}
            onPressedChange={() => setViewMode('list')}
            size="sm"
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="voice">Voice Agents</TabsTrigger>
          <TabsTrigger value="insight">Insight Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="voice">
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'flex flex-col gap-3'
            )}
          >
            {filteredVoiceAgents.map((agent) => (
              <VoiceAgentCard
                key={agent.id}
                agent={agent}
                viewMode={viewMode}
                onTest={() => handleTestCall(agent)}
                onView={() => handleViewDetails(agent)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insight">
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'flex flex-col gap-3'
            )}
          >
            {filteredInsightAgents.map((agent) => (
              <InsightAgentCard
                key={agent.id}
                agent={agent}
                viewMode={viewMode}
                onView={() => handleViewDetails(agent)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <CreateAssistantModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <AssistantDetailsDrawer
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        agent={selectedAgent}
      />
      <TestCallModal
        open={testCallOpen}
        onOpenChange={setTestCallOpen}
        agent={testCallAgent}
      />
    </div>
  );
}

interface VoiceAgentCardProps {
  agent: VoiceAgent;
  viewMode: 'grid' | 'list';
  onTest: () => void;
  onView: () => void;
}

function VoiceAgentCard({ agent, viewMode, onTest, onView }: VoiceAgentCardProps) {
  const directionStatus = agent.direction === 'inbound' ? 'info' : agent.direction === 'outbound' ? 'success' : 'neutral';
  const activityCue = getActivityCue(agent.callCount, agent.updatedAt);

  if (viewMode === 'list') {
    return (
      <Card className="cursor-pointer shadow-subtle transition-shadow hover:shadow-md" onClick={onView}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
              {agent.initials}
            </div>
            <div>
              <h3 className="font-medium text-foreground">{agent.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={directionStatus}>{agent.direction}</StatusBadge>
                <StatusBadge status="neutral">{agent.language}</StatusBadge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">{agent.callCount.toLocaleString()} calls · Updated {agent.updatedAt}</div>
              <div className={cn(
                "text-xs mt-0.5",
                activityCue.type === 'active' && "text-[hsl(var(--status-success))]",
                activityCue.type === 'inactive' && "text-muted-foreground",
                activityCue.type === 'review' && "text-[hsl(var(--status-warning))]"
              )}>
                {activityCue.text}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onTest(); }}>
              Test
            </Button>
            <AgentKebabMenu onTest={onTest} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer shadow-subtle transition-shadow hover:shadow-md" onClick={onView}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
            {agent.initials}
          </div>
          <AgentKebabMenu onTest={onTest} />
        </div>
        <h3 className="mb-2 font-medium text-foreground">{agent.name}</h3>
        <div className="mb-3 flex flex-wrap gap-1">
          <StatusBadge status={directionStatus}>{agent.direction}</StatusBadge>
          <StatusBadge status="neutral">{agent.language}</StatusBadge>
        </div>
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{agent.callCount.toLocaleString()} calls</span>
          <span>Updated {agent.updatedAt}</span>
        </div>
        <div className={cn(
          "mb-3 text-xs",
          activityCue.type === 'active' && "text-[hsl(var(--status-success))]",
          activityCue.type === 'inactive' && "text-muted-foreground",
          activityCue.type === 'review' && "text-[hsl(var(--status-warning))]"
        )}>
          {activityCue.text}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onTest();
          }}
        >
          <Play className="mr-2 h-3 w-3" />
          Test
        </Button>
      </CardContent>
    </Card>
  );
}

interface InsightAgentCardProps {
  agent: InsightAgent;
  viewMode: 'grid' | 'list';
  onView: () => void;
}

function InsightAgentCard({ agent, viewMode, onView }: InsightAgentCardProps) {
  const activityCue = getActivityCue(agent.callsAnalyzed, agent.updatedAt);

  if (viewMode === 'list') {
    return (
      <Card className="cursor-pointer shadow-subtle transition-shadow hover:shadow-md" onClick={onView}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium">
              {agent.initials}
            </div>
            <div>
              <h3 className="font-medium text-foreground">{agent.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status="info">Insight Agent</StatusBadge>
                <span className="text-xs text-muted-foreground">{agent.fields.length} fields</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">{agent.callsAnalyzed.toLocaleString()} calls analyzed · Updated {agent.updatedAt}</div>
            <div className={cn(
              "text-xs mt-0.5",
              activityCue.type === 'active' && "text-[hsl(var(--status-success))]",
              activityCue.type === 'inactive' && "text-muted-foreground",
              activityCue.type === 'review' && "text-[hsl(var(--status-warning))]"
            )}>
              {activityCue.text}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer shadow-subtle transition-shadow hover:shadow-md" onClick={onView}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium">
            {agent.initials}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Clone
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="mr-2 h-4 w-4" />
                History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="mb-2 font-medium text-foreground">{agent.name}</h3>
        <div className="mb-3 flex flex-wrap gap-1">
          <StatusBadge status="info">Insight Agent</StatusBadge>
          <StatusBadge status="neutral">{agent.fields.length} fields</StatusBadge>
        </div>
        <div className="mb-2 text-xs text-muted-foreground">
          <span>{agent.callsAnalyzed.toLocaleString()} calls analyzed</span>
          <span className="mx-2">•</span>
          <span>Updated {agent.updatedAt}</span>
        </div>
        <div className={cn(
          "text-xs",
          activityCue.type === 'active' && "text-[hsl(var(--status-success))]",
          activityCue.type === 'inactive' && "text-muted-foreground",
          activityCue.type === 'review' && "text-[hsl(var(--status-warning))]"
        )}>
          {activityCue.text}
        </div>
      </CardContent>
    </Card>
  );
}

interface AgentKebabMenuProps {
  onTest: () => void;
}

function AgentKebabMenu({ onTest }: AgentKebabMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onTest}>
          <Play className="mr-2 h-4 w-4" />
          Test
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          Clone
        </DropdownMenuItem>
        <DropdownMenuItem>
          <History className="mr-2 h-4 w-4" />
          History
        </DropdownMenuItem>
        <DropdownMenuItem>
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
