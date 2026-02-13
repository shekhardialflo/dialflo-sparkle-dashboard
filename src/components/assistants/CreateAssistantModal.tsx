import { useState } from 'react';
import { PhoneOutgoing, PhoneIncoming, ChevronRight, ChevronLeft, Check, X, Link2, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVoices, useCreateAgent } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type AgentMode = 'inbound' | 'outbound' | 'dual';

interface CreateAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = ['Basics', 'Voice', 'Prompt', 'Variables', 'Review'];

export function CreateAssistantModal({ open, onOpenChange }: CreateAssistantModalProps) {
  const { toast } = useToast();
  const { data: voices = [], isLoading: voicesLoading } = useVoices();
  const createAgent = useCreateAgent();
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('english');
  const [agentMode, setAgentMode] = useState<AgentMode>('outbound');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isInterruptible, setIsInterruptible] = useState(true);
  const [syncDual, setSyncDual] = useState(true);
  const [variables, setVariables] = useState<{ key: string; type: string }[]>([]);

  const resetForm = () => {
    setCurrentStep(0);
    setName('');
    setPrimaryLanguage('english');
    setAgentMode('outbound');
    setSelectedVoice('');
    setFirstMessage('');
    setSystemPrompt('');
    setIsInterruptible(true);
    setSyncDual(true);
    setVariables([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreate = async () => {
    try {
      const callType = agentMode === 'inbound' ? ('INCOMING' as const) : ('OUTGOING' as const);

      await createAgent.mutateAsync({
        agent_name: name,
        voice_id: selectedVoice,
        call_type: callType,
        prompt: { system: systemPrompt },
        welcome_text: { default: firstMessage },
        agent_phone_number: '',
        enabled: true,
      });

      // If dual mode, also create a paired agent with opposite direction
      if (agentMode === 'dual') {
        await createAgent.mutateAsync({
          agent_name: name + ' (Inbound)',
          voice_id: selectedVoice,
          call_type: 'INCOMING',
          prompt: { system: systemPrompt },
          welcome_text: { default: firstMessage },
          agent_phone_number: '',
          enabled: true,
        });
      }

      const modeLabel = agentMode === 'dual' ? ' (Dual pair)' : '';
      toast({
        title: 'Assistant created',
        description: `${name}${modeLabel} has been created successfully.`,
      });
      handleClose();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create assistant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const addVariable = () => {
    setVariables([...variables, { key: '', type: 'string' }]);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const directionFromMode = agentMode === 'inbound' ? 'Inbound' : agentMode === 'outbound' ? 'Outbound' : 'Inbound + Outbound';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Voice Agent</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center justify-between py-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'border-2 border-primary text-primary'
                    : 'border border-border text-muted-foreground'
                )}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 w-8 sm:w-16',
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[300px] py-4">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name *</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Sales Qualifier"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Language *</Label>
                <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Agent Mode *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Dual creates a linked inbound + outbound pair with shared config.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: 'inbound' as AgentMode, label: 'Inbound', icon: PhoneIncoming, desc: 'Receive calls' },
                    { value: 'outbound' as AgentMode, label: 'Outbound', icon: PhoneOutgoing, desc: 'Make calls' },
                    { value: 'dual' as AgentMode, label: 'Dual', icon: Link2, desc: 'Both directions' },
                  ].map((opt) => (
                    <Card
                      key={opt.value}
                      className={cn(
                        'cursor-pointer border-2 transition-colors',
                        agentMode === opt.value ? 'border-primary' : 'hover:border-primary/50'
                      )}
                      onClick={() => setAgentMode(opt.value)}
                    >
                      <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
                        <opt.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {agentMode === 'dual' && (
                  <div className="flex items-center justify-between rounded-lg border p-3 mt-3">
                    <div>
                      <Label className="text-sm">Sync changes across pair</Label>
                      <p className="text-xs text-muted-foreground">
                        Prompt, knowledge base, and insight agent stay in sync.
                      </p>
                    </div>
                    <Switch checked={syncDual} onCheckedChange={setSyncDual} />
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <Label>Select a Voice</Label>
              {voicesLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : voices.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No voices available.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {voices.map((voice) => (
                    <Card
                      key={voice.voice_id}
                      className={cn(
                        'cursor-pointer border-2 transition-colors',
                        selectedVoice === voice.voice_id ? 'border-primary' : 'hover:border-primary/50'
                      )}
                      onClick={() => setSelectedVoice(voice.voice_id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{voice.name}</h4>
                          </div>
                          {selectedVoice === voice.voice_id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first-message">First Message</Label>
                <Textarea
                  id="first-message"
                  placeholder="Hi, this is {{agent_name}} from {{company}}. Am I speaking with {{name}}?"
                  rows={3}
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{{variable}}'} syntax for dynamic content
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt / Objective</Label>
                <Textarea
                  id="system-prompt"
                  placeholder="You are a professional sales agent..."
                  rows={6}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="interruptible">Interruptible</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow caller to interrupt the agent while speaking
                  </p>
                </div>
                <Switch
                  id="interruptible"
                  checked={isInterruptible}
                  onCheckedChange={setIsInterruptible}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Custom Variables</Label>
                  <p className="text-sm text-muted-foreground">
                    Define variables to use in prompts
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addVariable}>
                  Add Variable
                </Button>
              </div>
              {variables.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No variables defined yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {variables.map((variable, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Variable key"
                        value={variable.key}
                        onChange={(e) => {
                          const updated = [...variables];
                          updated[index].key = e.target.value;
                          setVariables(updated);
                        }}
                      />
                      <Select
                        value={variable.type}
                        onValueChange={(value) => {
                          const updated = [...variables];
                          updated[index].type = value;
                          setVariables(updated);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => removeVariable(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4">
                <Label>Knowledge Base</Label>
                <Select disabled>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="No knowledge bases yet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No knowledge bases yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-medium">Review your configuration</h3>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium capitalize">{agentMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direction</span>
                  <span className="font-medium">{directionFromMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium capitalize">{primaryLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voice</span>
                  <span className="font-medium">
                    {voices.find((v) => v.voice_id === selectedVoice)?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interruptible</span>
                  <span className="font-medium">{isInterruptible ? 'Yes' : 'No'}</span>
                </div>
                {agentMode === 'dual' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sync pair</span>
                    <span className="font-medium">{syncDual ? 'Yes' : 'No'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variables</span>
                  <span className="font-medium">{variables.length}</span>
                </div>
              </div>
              {agentMode === 'dual' && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">
                    Two linked agents will be created — one for inbound and one for outbound — sharing the same prompt, knowledge base, and insight agent.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 0) {
                handleClose();
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 0 && !name}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={!name || createAgent.isPending}>
              {createAgent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Assistant
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
