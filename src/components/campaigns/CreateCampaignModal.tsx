import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Upload, FileSpreadsheet, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { voiceAgents, contactLists, insightAgents, phoneNumbers } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RetryStrategy, defaultRetryStrategy } from '@/types/retryStrategy';
import { RetryStrategyEditor } from './RetryStrategyEditor';

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = ['Campaign Settings', 'Calling List', 'Retry Strategy', 'Review & Launch'];

// Default dispositions for new campaigns
const defaultCampaignDispositions = [
  'Interested',
  'Not Interested',
  'Callback Requested',
  'Appointment Set',
  'Information Sent',
  'Do Not Call',
  'Wrong Number',
  'Invalid Number',
];

export function CreateCampaignModal({ open, onOpenChange }: CreateCampaignModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [selectedInsightAgent, setSelectedInsightAgent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [retryStrategy, setRetryStrategy] = useState<RetryStrategy>(defaultRetryStrategy);

  const resetForm = () => {
    setCurrentStep(0);
    setName('');
    setSelectedAssistant('');
    setSelectedNumbers([]);
    setStartDate('');
    setEndDate('');
    setSelectedList('');
    setSelectedInsightAgent('');
    setUploadedFile(null);
    setRetryStrategy(defaultRetryStrategy);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleLaunch = () => {
    toast({
      title: 'Campaign created',
      description: `${name} has been created and scheduled successfully.`,
    });
    handleClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const formatRetryTiming = () => {
    if (retryStrategy.backoffMode === 'FIXED') {
      return `Every ${retryStrategy.minMinutesBetween}m`;
    }
    return retryStrategy.backoffMinutes.map((m) => `${m}m`).join(' → ');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
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
                    'mx-2 h-0.5 w-12 sm:w-16',
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[350px] py-4">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Q1 Sales Outreach"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Assistant *</Label>
                <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.direction})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phone Numbers</Label>
                <Select
                  value={selectedNumbers[0] || ''}
                  onValueChange={(value) => setSelectedNumbers([value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select numbers" />
                  </SelectTrigger>
                  <SelectContent>
                    {phoneNumbers.map((num) => (
                      <SelectItem key={num.id} value={num.id}>
                        {num.number} ({num.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select List</Label>
                <Select value={selectedList} onValueChange={setSelectedList}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a list or upload new" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.records.toLocaleString()} records)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Auto-run Insights (Optional)</Label>
                <Select value={selectedInsightAgent} onValueChange={setSelectedInsightAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select insight agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {insightAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              {selectedList ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {contactLists.find((l) => l.id === selectedList)?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contactLists
                              .find((l) => l.id === selectedList)
                              ?.records.toLocaleString()}{' '}
                            records
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedList('')}>
                        Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div
                    className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 font-medium">Upload CSV File</p>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to select
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {uploadedFile && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{uploadedFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(uploadedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUploadedFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {uploadedFile && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Field Mapping</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Name Column</Label>
                          <Select defaultValue="name">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="full_name">Full Name</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Column</Label>
                          <Select defaultValue="phone">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="mobile">Mobile</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <RetryStrategyEditor
                value={retryStrategy}
                onChange={setRetryStrategy}
                campaignDispositions={defaultCampaignDispositions}
                compact
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">Review your campaign</h3>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign Name</span>
                  <span className="font-medium">{name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assistant</span>
                  <span className="font-medium">
                    {voiceAgents.find((a) => a.id === selectedAssistant)?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">List</span>
                  <span className="font-medium">
                    {contactLists.find((l) => l.id === selectedList)?.name ||
                      uploadedFile?.name ||
                      '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="font-medium">
                    {startDate && endDate
                      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(
                          endDate
                        ).toLocaleDateString()}`
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insight Agent</span>
                  <span className="font-medium">
                    {insightAgents.find((a) => a.id === selectedInsightAgent)?.name || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retry Strategy</span>
                  <span className="font-medium">
                    {retryStrategy.enabled
                      ? `${retryStrategy.maxAttempts} retries, ${formatRetryTiming()}`
                      : 'Off'}
                  </span>
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
              disabled={
                currentStep === 0 && (!name || !selectedAssistant || !startDate || !endDate)
              }
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} disabled={!name || !selectedAssistant}>
              Launch Campaign
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
