import { useState, useEffect } from 'react';
import { X, Plus, Slack, Globe, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import type { CallAgentResponse } from '@/types/api';
import { useTaskAgents, useCreateTaskAgent, useUpdateTaskAgent } from '@/hooks/use-agents';
import { useToast } from '@/hooks/use-toast';

interface InsightAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: CallAgentResponse | null;
}

interface InsightConfig {
  enabled: boolean;
  analysisPrompt: string;
  fields: { name: string; type: 'string' | 'number' | 'boolean' | 'enum' }[];
  destinations: { type: 'slack' | 'webhook'; url: string; enabled: boolean }[];
}

const emptyConfig: InsightConfig = {
  enabled: false,
  analysisPrompt: '',
  fields: [],
  destinations: [],
};

export function InsightAgentModal({ open, onOpenChange, agent }: InsightAgentModalProps) {
  const { toast } = useToast();
  const agentId = agent?.id ?? 0;
  const { data: taskAgents = [] } = useTaskAgents(agentId);
  const createTaskAgent = useCreateTaskAgent();
  const updateTaskAgent = useUpdateTaskAgent();

  const [config, setConfig] = useState<InsightConfig>(emptyConfig);

  // Find existing insight task agent for this agent
  const existingInsightAgent = taskAgents.find(
    (ta) => ta.agent_task === 'INSIGHT_GENERATION'
  );

  // Sync config when agent/taskAgents change
  useEffect(() => {
    if (existingInsightAgent) {
      const taskDetails = (existingInsightAgent.task_details || {}) as Record<string, unknown>;
      setConfig({
        enabled: existingInsightAgent.enabled,
        analysisPrompt: existingInsightAgent.prompt?.analysis || '',
        fields: Array.isArray(taskDetails.fields)
          ? (taskDetails.fields as InsightConfig['fields'])
          : [],
        destinations: Array.isArray(taskDetails.destinations)
          ? (taskDetails.destinations as InsightConfig['destinations'])
          : [],
      });
    } else {
      setConfig({ ...emptyConfig, enabled: true });
    }
  }, [existingInsightAgent?.id, agent?.id]);

  if (!agent) return null;

  const direction = agent.call_type === 'INCOMING' ? 'inbound' : 'outbound';
  const initials = agent.agent_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isSaving = createTaskAgent.isPending || updateTaskAgent.isPending;

  const addField = () => {
    setConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, { name: '', type: 'string' }],
    }));
  };

  const removeField = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const addDestination = (type: 'slack' | 'webhook') => {
    setConfig((prev) => ({
      ...prev,
      destinations: [...prev.destinations, { type, url: '', enabled: true }],
    }));
  };

  const removeDestination = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const taskData = {
        agent_id: agent.id,
        agent_name: 'Insight Agent for ' + agent.agent_name,
        agent_task: 'INSIGHT_GENERATION' as const,
        prompt: { analysis: config.analysisPrompt },
        task_details: {
          fields: config.fields,
          destinations: config.destinations,
        },
        enabled: config.enabled,
        version: existingInsightAgent ? existingInsightAgent.version : 1,
      };

      if (existingInsightAgent) {
        await updateTaskAgent.mutateAsync({
          agentId: existingInsightAgent.id,
          data: taskData,
        });
      } else {
        await createTaskAgent.mutateAsync(taskData);
      }

      toast({
        title: config.enabled ? 'Insight Agent saved' : 'Insight Agent disabled',
        description: `Configuration updated for ${agent.agent_name}.`,
      });
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save insight agent configuration.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {existingInsightAgent ? 'Manage' : 'Add'} Insight Agent
          </DialogTitle>
          <DialogDescription>
            Configure post-call analysis for <span className="font-medium">{agent.agent_name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Linked agent (read-only) */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Linked Voice Agent</Label>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {initials}
              </span>
              {agent.agent_name}
              <StatusBadge status="neutral" className="ml-auto">{direction}</StatusBadge>
            </div>
          </div>

          {/* Enable toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Enable Insight Agent</Label>
              <p className="text-xs text-muted-foreground">Run post-call analysis automatically</p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>

          {config.enabled && (
            <>
              {/* Analysis Prompt */}
              <div className="space-y-2">
                <Label>Analysis Prompt</Label>
                <Textarea
                  placeholder="Describe what information to extract from call transcripts..."
                  rows={4}
                  value={config.analysisPrompt}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, analysisPrompt: e.target.value }))
                  }
                />
              </div>

              {/* Extraction Fields */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Extraction Fields</Label>
                  <Button variant="outline" size="sm" onClick={addField}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add Field
                  </Button>
                </div>
                {config.fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No fields defined yet.</p>
                ) : (
                  <div className="space-y-2">
                    {config.fields.map((field, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Field name"
                          value={field.name}
                          onChange={(e) => {
                            const updated = [...config.fields];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setConfig((prev) => ({ ...prev, fields: updated }));
                          }}
                        />
                        <Select
                          value={field.type}
                          onValueChange={(value) => {
                            const updated = [...config.fields];
                            updated[index] = { ...updated[index], type: value as 'string' | 'number' | 'boolean' | 'enum' };
                            setConfig((prev) => ({ ...prev, fields: updated }));
                          }}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="enum">Enum</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => removeField(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destinations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Post-call Destinations</Label>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => addDestination('slack')}>
                      <Slack className="mr-1 h-3 w-3" />
                      Slack
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addDestination('webhook')}>
                      <Globe className="mr-1 h-3 w-3" />
                      Webhook
                    </Button>
                  </div>
                </div>
                {config.destinations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No destinations configured.</p>
                ) : (
                  <div className="space-y-2">
                    {config.destinations.map((dest, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <StatusBadge status="neutral" className="shrink-0">
                          {dest.type === 'slack' ? 'Slack' : 'Webhook'}
                        </StatusBadge>
                        <Input
                          placeholder={dest.type === 'slack' ? '#channel-name' : 'https://...'}
                          value={dest.url}
                          onChange={(e) => {
                            const updated = [...config.destinations];
                            updated[index] = { ...updated[index], url: e.target.value };
                            setConfig((prev) => ({ ...prev, destinations: updated }));
                          }}
                          className="flex-1"
                        />
                        <Switch
                          checked={dest.enabled}
                          onCheckedChange={(checked) => {
                            const updated = [...config.destinations];
                            updated[index] = { ...updated[index], enabled: checked };
                            setConfig((prev) => ({ ...prev, destinations: updated }));
                          }}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeDestination(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
