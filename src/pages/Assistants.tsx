import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Play, History, BarChart3, Trash2, Pencil, Lightbulb } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
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
import { voiceAgents, type VoiceAgent } from '@/data/mockData';
import { CreateAssistantModal } from '@/components/assistants/CreateAssistantModal';
import { AssistantDetailsDrawer } from '@/components/assistants/AssistantDetailsDrawer';
import { TestCallModal } from '@/components/assistants/TestCallModal';
import { InsightAgentModal } from '@/components/assistants/InsightAgentModal';
import { cn } from '@/lib/utils';

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'inactive') return 'warning';
  return 'neutral';
}

export default function Assistants() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [testCallOpen, setTestCallOpen] = useState(false);
  const [testCallAgent, setTestCallAgent] = useState<VoiceAgent | null>(null);
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [insightAgent, setInsightAgent] = useState<VoiceAgent | null>(null);

  const filteredAgents = voiceAgents
    .filter((agent) => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDirection = directionFilter === 'all' || agent.direction === directionFilter;
      return matchesSearch && matchesDirection;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const handleTestCall = (agent: VoiceAgent) => {
    setTestCallAgent(agent);
    setTestCallOpen(true);
  };

  const handleEditAgent = (agent: VoiceAgent) => {
    setSelectedAgent(agent);
    setDetailsOpen(true);
  };

  const handleHistory = (agentId: string) => {
    navigate(`/calls?assistant=${agentId}`);
  };

  const handleAnalytics = (agentId: string) => {
    navigate(`/analytics?assistant=${agentId}`);
  };

  const handleInsightAgent = (agent: VoiceAgent) => {
    setInsightAgent(agent);
    setInsightModalOpen(true);
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
            <SelectItem value="webcall">Web</SelectItem>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAgents.map((agent) => (
          <VoiceAgentCard
            key={agent.id}
            agent={agent}
            onTest={() => handleTestCall(agent)}
            onEdit={() => handleEditAgent(agent)}
            onHistory={() => handleHistory(agent.id)}
            onAnalytics={() => handleAnalytics(agent.id)}
            onInsight={() => handleInsightAgent(agent)}
          />
        ))}
      </div>

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
    </div>
  );
}

interface VoiceAgentCardProps {
  agent: VoiceAgent;
  onTest: () => void;
  onEdit: () => void;
  onHistory: () => void;
  onAnalytics: () => void;
  onInsight: () => void;
}

function VoiceAgentCard({ agent, onTest, onEdit, onHistory, onAnalytics, onInsight }: VoiceAgentCardProps) {
  return (
    <Card className="transition-colors hover:bg-muted/20">
      <CardContent className="p-4">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 font-medium text-xs">
            {agent.initials}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onInsight}>
                <Lightbulb className="mr-2 h-4 w-4" />
                {agent.insightConfig?.enabled ? 'Manage Insight Agent' : 'Add Insight Agent'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="mb-2 font-medium text-foreground text-sm">{agent.name}</h3>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <StatusBadge status="neutral">{agent.direction}</StatusBadge>
          <StatusBadge status="neutral">{agent.language}</StatusBadge>
          <StatusBadge status={getStatusBadgeVariant(agent.status)}>{agent.status}</StatusBadge>
        </div>
        {agent.insightConfig?.enabled && (
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
