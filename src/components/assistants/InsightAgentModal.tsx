import { useState, useEffect } from 'react';
import { X, Plus, Slack, Globe } from 'lucide-react';
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
import { type VoiceAgent, type InsightConfig } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface InsightAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: VoiceAgent | null;
}

const emptyConfig: InsightConfig = {
  enabled: false,
  analysisPrompt: '',
  fields: [],
  destinations: [],
};

export function InsightAgentModal({ open, onOpenChange, agent }: InsightAgentModalProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<InsightConfig>(emptyConfig);

  useEffect(() => {
    if (agent?.insightConfig) {
      setConfig({ ...agent.insightConfig });
    } else {
      setConfig({ ...emptyConfig, enabled: true });
    }
  }, [agent]);

  if (!agent) return null;

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

  const handleSave = () => {
    toast({
      title: config.enabled ? 'Insight Agent saved' : 'Insight Agent disabled',
      description: `Configuration updated for ${agent.name}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {agent.insightConfig?.enabled ? 'Manage' : 'Add'} Insight Agent
          </DialogTitle>
          <DialogDescription>
            Configure post-call analysis for <span className="font-medium">{agent.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Linked agent (read-only) */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Linked Voice Agent</Label>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {agent.initials}
              </span>
              {agent.name}
              <StatusBadge status="neutral" className="ml-auto">{agent.direction}</StatusBadge>
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
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
