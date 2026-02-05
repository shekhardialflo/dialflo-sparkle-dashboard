import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Play, History, BarChart3, Trash2, Pencil } from 'lucide-react';
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
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

  const handleHistory = (agentId: string) => {
    navigate(`/calls?assistant=${agentId}`);
  };

  const handleAnalytics = (agentId: string) => {
    navigate(`/analytics?assistant=${agentId}`);
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
          <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setActiveTab(value === 'insight' ? 'insight' : 'voice'); }}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="insight">Insight</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="calls">Most Calls</SelectItem>
            </SelectContent>
          </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="voice">Voice Agents</TabsTrigger>
          <TabsTrigger value="insight">Insight Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="voice">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVoiceAgents.map((agent) => (
              <VoiceAgentCard
                key={agent.id}
                agent={agent}
                onTest={() => handleTestCall(agent)}
                onView={() => handleViewDetails(agent)}
                onHistory={() => handleHistory(agent.id)}
                onAnalytics={() => handleAnalytics(agent.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insight">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredInsightAgents.map((agent) => (
              <InsightAgentCard
                key={agent.id}
                agent={agent}
                onView={() => handleViewDetails(agent)}
                onHistory={() => handleHistory(agent.id)}
                onAnalytics={() => handleAnalytics(agent.id)}
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
  onTest: () => void;
  onView: () => void;
  onHistory: () => void;
  onAnalytics: () => void;
}

function VoiceAgentCard({ agent, onTest, onView, onHistory, onAnalytics }: VoiceAgentCardProps) {
  const activityCue = getActivityCue(agent.callCount, agent.updatedAt);

  return (
    <Card className="transition-colors hover:bg-muted/20">
      <CardContent className="p-4">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 font-medium text-xs">
            {agent.initials}
          </div>
          <AgentKebabMenu onEdit={onView} onTest={onTest} onHistory={onHistory} onAnalytics={onAnalytics} />
        </div>
        <h3 className="mb-2 font-medium text-foreground text-sm">{agent.name}</h3>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <StatusBadge status="neutral">{agent.direction}</StatusBadge>
          <StatusBadge status="neutral">{agent.language}</StatusBadge>
        </div>
        <div className="mb-4 text-[11px] text-muted-foreground/70">
          {agent.callCount.toLocaleString()} calls · Updated {agent.updatedAt} · <span className={cn(
            activityCue.type === 'active' && "text-muted-foreground",
            activityCue.type === 'inactive' && "text-muted-foreground/50",
            activityCue.type === 'review' && "text-muted-foreground"
          )}>{activityCue.text}</span>
        </div>
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

interface InsightAgentCardProps {
  agent: InsightAgent;
  onView: () => void;
  onHistory: () => void;
  onAnalytics: () => void;
}

function InsightAgentCard({ agent, onView, onHistory, onAnalytics }: InsightAgentCardProps) {
  const activityCue = getActivityCue(agent.callsAnalyzed, agent.updatedAt);

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
              <DropdownMenuItem onClick={onView}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Agent
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
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="mb-2 font-medium text-foreground text-sm">{agent.name}</h3>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <StatusBadge status="neutral">Insight Agent</StatusBadge>
          <StatusBadge status="neutral">{agent.fields.length} fields</StatusBadge>
        </div>
        <div className="text-[11px] text-muted-foreground/70">
          {agent.callsAnalyzed.toLocaleString()} calls analyzed · Updated {agent.updatedAt} · <span className={cn(
            activityCue.type === 'active' && "text-muted-foreground",
            activityCue.type === 'inactive' && "text-muted-foreground/50",
            activityCue.type === 'review' && "text-muted-foreground"
          )}>{activityCue.text}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface AgentKebabMenuProps {
  onEdit: () => void;
  onTest: () => void;
  onHistory: () => void;
  onAnalytics: () => void;
}

function AgentKebabMenu({ onEdit, onTest, onHistory, onAnalytics }: AgentKebabMenuProps) {
  return (
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
        <DropdownMenuItem onClick={onTest}>
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
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
