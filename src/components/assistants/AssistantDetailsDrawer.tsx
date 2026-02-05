import { useState } from 'react';
import { X, Mic, Settings, FileText, Database, Phone, Code } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/ui/status-badge';
import { type VoiceAgent, type InsightAgent, voices } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssistantDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: VoiceAgent | InsightAgent | null;
}

const sideNavItems = [
  { id: 'prompt', label: 'Prompt', icon: FileText },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'variables', label: 'Variables', icon: Code },
  { id: 'knowledge', label: 'Knowledge Base', icon: Database },
  { id: 'settings', label: 'Call Settings', icon: Settings },
  { id: 'number', label: 'Attach Number', icon: Phone },
];

const llmProviders = [
  { id: 'default', name: 'Default' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google' },
  { id: 'azure', name: 'Azure OpenAI' },
];

const sttProviders = [
  { id: 'default', name: 'Default' },
  { id: 'deepgram', name: 'Deepgram' },
  { id: 'whisper', name: 'Whisper' },
  { id: 'google-stt', name: 'Google STT' },
  { id: 'azure-stt', name: 'Azure STT' },
];

export function AssistantDetailsDrawer({ open, onOpenChange, agent }: AssistantDetailsDrawerProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('prompt');
  const [selectedLLM, setSelectedLLM] = useState('default');
  const [selectedSTT, setSelectedSTT] = useState('default');

  if (!agent) return null;

  const isVoiceAgent = agent.type === 'voice';
  const voiceAgent = isVoiceAgent ? (agent as VoiceAgent) : null;
  const insightAgent = !isVoiceAgent ? (agent as InsightAgent) : null;

  const handleSave = () => {
    toast({
      title: 'Changes saved',
      description: 'Your changes have been saved successfully.',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl p-0" side="right">
        <div className="flex h-full">
          {/* Side navigation */}
          {isVoiceAgent && (
            <div className="w-48 border-r border-border bg-muted/30 p-4">
              <div className="mb-6">
                <h3 className="text-xs font-medium uppercase text-muted-foreground">Settings</h3>
                <nav className="mt-3 space-y-1">
                  {sideNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                        activeSection === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex flex-1 flex-col">
            <SheetHeader className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                    {agent.initials}
                  </div>
                  <div>
                    <SheetTitle>{agent.name}</SheetTitle>
                    <div className="mt-1 flex items-center gap-2">
                      {isVoiceAgent && voiceAgent && (
                        <>
                          <StatusBadge status={voiceAgent.direction === 'inbound' ? 'info' : 'success'}>
                            {voiceAgent.direction}
                          </StatusBadge>
                          <StatusBadge status="neutral">{voiceAgent.language}</StatusBadge>
                        </>
                      )}
                      {!isVoiceAgent && (
                        <StatusBadge status="info">Insight Agent</StatusBadge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 p-6">
              {isVoiceAgent && voiceAgent && (
                <>
                  {activeSection === 'prompt' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>First Message</Label>
                        <Textarea
                          defaultValue={voiceAgent.firstMessage}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>System Prompt</Label>
                        <Textarea
                          defaultValue={voiceAgent.systemPrompt}
                          rows={8}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <Label>Interruptible</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow caller to interrupt the agent
                          </p>
                        </div>
                        <Switch defaultChecked={voiceAgent.isInterruptible} />
                      </div>
                    </div>
                  )}

                  {activeSection === 'voice' && (
                    <div className="space-y-4">
                      <Label>Selected Voice</Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {voices.map((voice) => (
                          <div
                            key={voice.id}
                            className={cn(
                              'rounded-lg border-2 p-4 cursor-pointer transition-colors',
                              voice.id === voiceAgent.voiceId
                                ? 'border-primary bg-primary/5'
                                : 'hover:border-primary/50'
                            )}
                          >
                            <h4 className="font-medium">{voice.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {voice.gender} • {voice.accent}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Providers Section */}
                      <div className="mt-6 pt-6 border-t border-border">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Providers</Label>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm">LLM Provider</Label>
                            <Select value={selectedLLM} onValueChange={setSelectedLLM}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {llmProviders.map((provider) => (
                                  <SelectItem key={provider.id} value={provider.id}>
                                    {provider.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Speech-to-Text (STT)</Label>
                            <Select value={selectedSTT} onValueChange={setSelectedSTT}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sttProviders.map((provider) => (
                                  <SelectItem key={provider.id} value={provider.id}>
                                    {provider.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'variables' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Custom Variables</Label>
                        <Button variant="outline" size="sm">Add Variable</Button>
                      </div>
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No custom variables defined.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeSection === 'knowledge' && (
                    <div className="space-y-4">
                      <Label>Knowledge Base</Label>
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No knowledge base attached.
                        </p>
                        <Button variant="outline" className="mt-4">
                          Add Knowledge Base
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeSection === 'settings' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Max Call Duration (seconds)</Label>
                        <Input type="number" defaultValue="600" />
                      </div>
                      <div className="space-y-2">
                        <Label>Recording</Label>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <span className="text-sm">Enable call recording</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'number' && (
                    <div className="space-y-4">
                      <Label>Phone Numbers</Label>
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No phone numbers attached.
                        </p>
                        <Button variant="outline" className="mt-4">
                          Attach Number
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!isVoiceAgent && insightAgent && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Analysis Prompt</Label>
                    <Textarea
                      defaultValue={insightAgent.analysisPrompt}
                      rows={6}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Extraction Fields</Label>
                      <Button variant="outline" size="sm">Add Field</Button>
                    </div>
                    <div className="space-y-2">
                      {insightAgent.fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                          <span className="flex-1 font-medium">{field.name}</span>
                          <StatusBadge status="neutral">{field.type}</StatusBadge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Calls analyzed</span>
                      <span className="font-medium">{insightAgent.callsAnalyzed.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="border-t border-border p-4">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
