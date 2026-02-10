import { useState } from 'react';
import { X, Mic, Settings, FileText, Database, Phone, Code, Cpu } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/ui/status-badge';
import { type VoiceAgent, voices } from '@/data/mockData';
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
  agent: VoiceAgent | null;
}

const sideNavItems = [
  { id: 'prompt', label: 'Prompt', icon: FileText },
  { id: 'ai-stack', label: 'AI Stack', icon: Cpu },
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

const ttsProviders = [
  { id: 'default', name: 'Default' },
  { id: 'elevenlabs', name: 'ElevenLabs' },
  { id: 'google-tts', name: 'Google TTS' },
  { id: 'azure-tts', name: 'Azure TTS' },
  { id: 'playht', name: 'Play.ht' },
];

export function AssistantDetailsDrawer({ open, onOpenChange, agent }: AssistantDetailsDrawerProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('prompt');
  const [selectedLLM, setSelectedLLM] = useState(agent?.llmProvider || 'default');
  const [selectedSTT, setSelectedSTT] = useState(agent?.sttProvider || 'default');
  const [selectedTTS, setSelectedTTS] = useState(agent?.ttsProvider || 'default');

  if (!agent) return null;

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
                      <StatusBadge status={agent.direction === 'inbound' ? 'info' : 'success'}>
                        {agent.direction}
                      </StatusBadge>
                      <StatusBadge status="neutral">{agent.language}</StatusBadge>
                      {agent.agentMode === 'dual' && (
                        <StatusBadge status="info">Dual</StatusBadge>
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
              {activeSection === 'prompt' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>First Message</Label>
                    <Textarea defaultValue={agent.firstMessage} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>System Prompt</Label>
                    <Textarea defaultValue={agent.systemPrompt} rows={8} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label>Interruptible</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow caller to interrupt the agent
                      </p>
                    </div>
                    <Switch defaultChecked={agent.isInterruptible} />
                  </div>
                  {agent.agentMode === 'dual' && agent.syncWithLinked && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Dual mode:</span> Changes to the prompt will sync with the linked agent.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'ai-stack' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-1">AI Stack</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Configure the language model, speech recognition, and voice synthesis providers.
                    </p>
                  </div>

                  {/* LLM Provider */}
                  <div className="space-y-2">
                    <Label className="text-sm">Language Model (LLM)</Label>
                    <Select value={selectedLLM} onValueChange={setSelectedLLM}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {llmProviders.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* STT Provider */}
                  <div className="space-y-2">
                    <Label className="text-sm">Speech-to-Text (STT)</Label>
                    <Select value={selectedSTT} onValueChange={setSelectedSTT}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sttProviders.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* TTS Provider + Voice */}
                  <div className="space-y-2">
                    <Label className="text-sm">Text-to-Speech (TTS)</Label>
                    <Select value={selectedTTS} onValueChange={setSelectedTTS}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ttsProviders.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Voice selector - compact */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Voice</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {voices.slice(0, 4).map((voice) => (
                        <div
                          key={voice.id}
                          className={cn(
                            'rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm',
                            voice.id === agent.voiceId
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          )}
                        >
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-muted-foreground ml-1.5 text-xs">
                            {voice.gender} · {voice.accent}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Showing top voices. {voices.length - 4} more available.
                    </p>
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
