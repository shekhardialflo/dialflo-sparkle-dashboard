import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Play, History, BarChart3, Trash2, Pencil, Lightbulb, HeartPulse } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useAgents, useDeleteAgent, useAllTaskAgents } from '@/hooks/use-agents';
import type { CallAgentResponse } from '@/types/api';
import { CreateAssistantModal } from '@/components/assistants/CreateAssistantModal';
import { AssistantDetailsDrawer } from '@/components/assistants/AssistantDetailsDrawer';
import { TestCallModal } from '@/components/assistants/TestCallModal';
import { InsightAgentModal } from '@/components/assistants/InsightAgentModal';
import { AgentHealthDrawer } from '@/components/assistants/AgentHealthDrawer';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function getAgentDisplayInfo(agent: CallAgentResponse) {
  const direction = agent.call_type === 'INCOMING' ? 'inbound' : 'outbound';
  const status = agent.enabled ? 'active' : 'inactive';
  const initials = agent.agent_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return { direction, status, initials };
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'inactive') return 'warning';
  return 'neutral';
}

export default function Assistants() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<CallAgentResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [testCallOpen, setTestCallOpen] = useState(false);
  const [testCallAgent, setTestCallAgent] = useState<CallAgentResponse | null>(null);
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [insightAgent, setInsightAgent] = useState<CallAgentResponse | null>(null);
  const [healthOpen, setHealthOpen] = useState(false);
  const [healthAgent, setHealthAgent] = useState<CallAgentResponse | null>(null);

  const { data: agents = [], isLoading, error } = useAgents();
  const { data: taskAgents = [] } = useAllTaskAgents();
  const deleteAgent = useDeleteAgent();

  // Build set of agent IDs that have active insight task agents
  const agentIdsWithInsight = new Set(
    taskAgents
      .filter((ta) => ta.agent_task === 'INSIGHT_GENERATION' && ta.enabled)
      .map((ta) => ta.agent_id)
  );

  const filteredAgents = agents
    .filter((agent) => {
      const matchesSearch = agent.agent_name.toLowerCase().includes(searchQuery.toLowerCase());
      const { direction } = getAgentDisplayInfo(agent);
      const matchesDirection = directionFilter === 'all' || direction === directionFilter;
      return matchesSearch && matchesDirection;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.agent_name.localeCompare(b.agent_name);
      if (sortBy === 'updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      return 0;
    });

  const handleTestCall = (agent: CallAgentResponse) => {
    setTestCallAgent(agent);
    setTestCallOpen(true);
  };

  const handleEditAgent = (agent: CallAgentResponse) => {
    setSelectedAgent(agent);
    setDetailsOpen(true);
  };

  const handleHistory = (agentId: number) => {
    navigate(`/calls?assistant=${agentId}`);
  };

  const handleAnalytics = (agentId: number) => {
    navigate(`/analytics?assistant=${agentId}`);
  };

  const handleInsightAgent = (agent: CallAgentResponse) => {
    setInsightAgent(agent);
    setInsightModalOpen(true);
  };

  const handleHealth = (agent: CallAgentResponse) => {
    setHealthAgent(agent);
    setHealthOpen(true);
  };

  const handleDelete = (agent: CallAgentResponse) => {
    deleteAgent.mutate(
      { agentId: agent.id },
      {
        onSuccess: () => {
          toast({
            title: 'Agent deleted',
            description: `${agent.agent_name} has been deleted.`,
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to delete agent.',
            variant: 'destructive',
          });
        },
      }
    );
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

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search assistants..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-sm"
        />
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="mb-4 flex items-start justify-between">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="mb-2 h-4 w-3/4" />
                <div className="mb-3 flex gap-1.5">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">Failed to load assistants. Please try again later.</p>
        </div>
      )}

      {!isLoading && !error && filteredAgents.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {agents.length === 0
              ? 'No assistants yet. Create your first one!'
              : 'No assistants match your filters.'}
          </p>
        </div>
      )}

      {!isLoading && !error && filteredAgents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAgents.map((agent) => (
            <VoiceAgentCard
              key={agent.id}
              agent={agent}
              hasInsight={agentIdsWithInsight.has(agent.id)}
              onTest={() => handleTestCall(agent)}
              onEdit={() => handleEditAgent(agent)}
              onHistory={() => handleHistory(agent.id)}
              onAnalytics={() => handleAnalytics(agent.id)}
              onInsight={() => handleInsightAgent(agent)}
              onHealth={() => handleHealth(agent)}
              onDelete={() => handleDelete(agent)}
            />
          ))}
        </div>
      )}

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
      <InsightAgentModal
        open={insightModalOpen}
        onOpenChange={setInsightModalOpen}
        agent={insightAgent}
      />
      <AgentHealthDrawer
        open={healthOpen}
        onOpenChange={setHealthOpen}
        agent={healthAgent}
      />
    </div>
  );
}

interface VoiceAgentCardProps {
  agent: CallAgentResponse;
  hasInsight: boolean;
  onTest: () => void;
  onEdit: () => void;
  onHistory: () => void;
  onAnalytics: () => void;
  onInsight: () => void;
  onHealth: () => void;
  onDelete: () => void;
}

function VoiceAgentCard({
  agent,
  hasInsight,
  onTest,
  onEdit,
  onHistory,
  onAnalytics,
  onInsight,
  onHealth,
  onDelete,
}: VoiceAgentCardProps) {
  const { direction, status, initials } = getAgentDisplayInfo(agent);

  return (
    <Card className="transition-colors hover:bg-muted/20">
      <CardContent className="p-4">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 font-medium text-xs">
            {initials}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Agent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTest(); }}>
                <Play className="mr-2 h-4 w-4" />
                Test
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHistory}>
                <History className="mr-2 h-4 w-4" />
                History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAnalytics}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHealth}>
                <HeartPulse className="mr-2 h-4 w-4" />
                Health
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onInsight}>
                <Lightbulb className="mr-2 h-4 w-4" />
                {hasInsight ? 'Manage Insight Agent' : 'Add Insight Agent'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="mb-2 font-medium text-foreground text-sm">{agent.agent_name}</h3>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <StatusBadge status="neutral">{direction}</StatusBadge>
          <StatusBadge status={getStatusBadgeVariant(status)}>{status}</StatusBadge>
        </div>
        {hasInsight && (
          <div className="mb-3 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <Lightbulb className="h-3 w-3" />
            Insight Agent attached
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onTest();
          }}
        >
          Test
        </Button>
      </CardContent>
    </Card>
  );
}
