import { useState } from 'react';
import { Bot, Lightbulb, PhoneOutgoing, PhoneIncoming, Globe, ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { voices } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CreateAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AgentType = 'voice' | 'insight' | null;
type Direction = 'inbound' | 'outbound' | 'webcall';

const steps = ['Basics', 'Voice', 'Prompt', 'Variables', 'Review'];

export function CreateAssistantModal({ open, onOpenChange }: CreateAssistantModalProps) {
  const { toast } = useToast();
  const [agentType, setAgentType] = useState<AgentType>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('english');
  const [secondaryLanguage, setSecondaryLanguage] = useState('');
  const [direction, setDirection] = useState<Direction>('outbound');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isInterruptible, setIsInterruptible] = useState(true);
  const [variables, setVariables] = useState<{ key: string; type: string }[]>([]);

  // Insight agent form state
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [insightFields, setInsightFields] = useState<{ name: string; type: string }[]>([]);

  const resetForm = () => {
    setAgentType(null);
    setCurrentStep(0);
    setName('');
    setPrimaryLanguage('english');
    setSecondaryLanguage('');
    setDirection('outbound');
    setSelectedVoice('');
    setFirstMessage('');
    setSystemPrompt('');
    setIsInterruptible(true);
    setVariables([]);
    setAnalysisPrompt('');
    setInsightFields([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreate = () => {
    toast({
      title: 'Assistant created',
      description: `${name} has been created successfully.`,
    });
    handleClose();
  };

  const addVariable = () => {
    setVariables([...variables, { key: '', type: 'string' }]);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const addInsightField = () => {
    setInsightFields([...insightFields, { name: '', type: 'string' }]);
  };

  const removeInsightField = (index: number) => {
    setInsightFields(insightFields.filter((_, i) => i !== index));
  };

  // Type selector
  if (!agentType) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Assistant</DialogTitle>
            <DialogDescription>Choose the type of assistant you want to create</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Card
              className={cn(
                'cursor-pointer border-2 transition-colors hover:border-primary',
                agentType === 'voice' && 'border-primary'
              )}
              onClick={() => setAgentType('voice')}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">Voice Agent</h3>
                  <p className="text-sm text-muted-foreground">
                    Handle calls - inbound, outbound, or web
                  </p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card
              className={cn(
                'cursor-pointer border-2 transition-colors hover:border-primary',
                agentType === 'insight' && 'border-primary'
              )}
              onClick={() => setAgentType('insight')}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">Insight Agent</h3>
                  <p className="text-sm text-muted-foreground">
                    Extract data from call transcripts
                  </p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Insight agent form
  if (agentType === 'insight') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Insight Agent</DialogTitle>
            <DialogDescription>Configure your post-call analysis agent</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="insight-name">Agent Name</Label>
              <Input
                id="insight-name"
                placeholder="e.g., Sales Call Analyzer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="analysis-prompt">Analysis Prompt</Label>
              <Textarea
                id="analysis-prompt"
                placeholder="Describe what information to extract from call transcripts..."
                rows={4}
                value={analysisPrompt}
                onChange={(e) => setAnalysisPrompt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Extraction Fields</Label>
                <Button variant="outline" size="sm" onClick={addInsightField}>
                  Add Field
                </Button>
              </div>
              {insightFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No fields defined yet.</p>
              ) : (
                <div className="space-y-2">
                  {insightFields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => {
                          const updated = [...insightFields];
                          updated[index].name = e.target.value;
                          setInsightFields(updated);
                        }}
                      />
                      <Select
                        value={field.type}
                        onValueChange={(value) => {
                          const updated = [...insightFields];
                          updated[index].type = value;
                          setInsightFields(updated);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="enum">Enum</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInsightField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setAgentType(null)}>
              Back
            </Button>
            <Button onClick={handleCreate} disabled={!name || !analysisPrompt}>
              Create Insight Agent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Voice agent stepper
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
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <Label>Secondary Language</Label>
                  <Select value={secondaryLanguage} onValueChange={setSecondaryLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Direction *</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: 'outbound', label: 'Outbound', icon: PhoneOutgoing },
                    { value: 'inbound', label: 'Inbound', icon: PhoneIncoming },
                    { value: 'webcall', label: 'Webcall', icon: Globe },
                  ].map((opt) => (
                    <Card
                      key={opt.value}
                      className={cn(
                        'cursor-pointer border-2 transition-colors',
                        direction === opt.value ? 'border-primary' : 'hover:border-primary/50'
                      )}
                      onClick={() => setDirection(opt.value as Direction)}
                    >
                      <CardContent className="flex items-center gap-3 p-3">
                        <opt.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <Tabs defaultValue="most_used">
                <TabsList>
                  <TabsTrigger value="most_used">Most Used</TabsTrigger>
                  <TabsTrigger value="neutral">Neutral</TabsTrigger>
                </TabsList>
                <TabsContent value="most_used" className="mt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {voices
                      .filter((v) => v.category === 'most_used')
                      .map((voice) => (
                        <Card
                          key={voice.id}
                          className={cn(
                            'cursor-pointer border-2 transition-colors',
                            selectedVoice === voice.id ? 'border-primary' : 'hover:border-primary/50'
                          )}
                          onClick={() => setSelectedVoice(voice.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{voice.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {voice.gender} • {voice.accent}
                                </p>
                              </div>
                              {selectedVoice === voice.id && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="neutral" className="mt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {voices
                      .filter((v) => v.category === 'neutral')
                      .map((voice) => (
                        <Card
                          key={voice.id}
                          className={cn(
                            'cursor-pointer border-2 transition-colors',
                            selectedVoice === voice.id ? 'border-primary' : 'hover:border-primary/50'
                          )}
                          onClick={() => setSelectedVoice(voice.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{voice.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {voice.gender} • {voice.accent}
                                </p>
                              </div>
                              {selectedVoice === voice.id && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
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
                  placeholder="You are a professional sales agent. Your goal is to qualify leads based on budget, authority, need, and timeline..."
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
                  <span className="text-muted-foreground">Direction</span>
                  <span className="font-medium capitalize">{direction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium capitalize">{primaryLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voice</span>
                  <span className="font-medium">
                    {voices.find((v) => v.id === selectedVoice)?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interruptible</span>
                  <span className="font-medium">{isInterruptible ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variables</span>
                  <span className="font-medium">{variables.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 0) {
                setAgentType(null);
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
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
            <Button onClick={handleCreate} disabled={!name}>
              Create Assistant
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
