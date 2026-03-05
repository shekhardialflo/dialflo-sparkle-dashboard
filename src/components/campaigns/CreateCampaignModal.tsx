import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Check, Upload, FileSpreadsheet, X, Loader2, CalendarIcon } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays, setHours, setMinutes, nextMonday, isWeekend } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { RetryStrategy, defaultRetryStrategy } from '@/types/retryStrategy';
import { RetryStrategyEditor } from './RetryStrategyEditor';
import { useAgents } from '@/hooks/use-agents';
import { useAudiences, useCreateCampaign, useCreateAudience } from '@/hooks/use-campaigns';

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

  // API hooks
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: audiences = [], isLoading: audiencesLoading } = useAudiences();
  const createCampaign = useCreateCampaign();
  const createAudience = useCreateAudience();

  // Form state
  const [name, setName] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState('');
  
  // Start scheduling
  const [startMode, setStartMode] = useState<'now' | 'schedule'>('now');
  const [startDateVal, setStartDateVal] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('09:00');
  
  // End scheduling
  const [endMode, setEndMode] = useState<'until_paused' | 'end_on'>('until_paused');
  const [endDateVal, setEndDateVal] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState('18:00');

  const [selectedList, setSelectedList] = useState('');
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [createdAudienceId, setCreatedAudienceId] = useState<string | null>(null);
  const [retryStrategy, setRetryStrategy] = useState<RetryStrategy>(defaultRetryStrategy);

  // Generate time options in 15-min increments
  const timeOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
        opts.push({ value: val, label });
      }
    }
    return opts;
  }, []);

  // Quick-pick chips for start
  const quickPicks = useMemo(() => {
    const now = new Date();
    const today6pm = setMinutes(setHours(new Date(), 18), 0);
    const tomorrow9am = setMinutes(setHours(addDays(new Date(), 1), 9), 0);
    let nextBiz = addDays(new Date(), 1);
    while (isWeekend(nextBiz)) nextBiz = addDays(nextBiz, 1);
    const nextBiz10am = setMinutes(setHours(nextBiz, 10), 0);
    return [
      { label: 'Today 6 PM', date: today6pm, time: '18:00', disabled: now > today6pm },
      { label: 'Tomorrow 9 AM', date: tomorrow9am, time: '09:00', disabled: false },
      { label: 'Next business day 10 AM', date: nextBiz10am, time: '10:00', disabled: false },
    ];
  }, []);

  // Combine date + time into ISO strings for the API
  const getStartISO = () => {
    if (startMode === 'now') return new Date().toISOString();
    if (!startDateVal) return null;
    const [h, m] = startTime.split(':').map(Number);
    const d = new Date(startDateVal);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const getEndISO = () => {
    if (endMode === 'until_paused') return null;
    if (!endDateVal) return null;
    const [h, m] = endTime.split(':').map(Number);
    const d = new Date(endDateVal);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const endSummary = useMemo(() => {
    if (endMode === 'until_paused' || !endDateVal) return null;
    const [h, m] = endTime.split(':').map(Number);
    const d = new Date(endDateVal);
    d.setHours(h, m, 0, 0);
    const timeLabel = timeOptions.find(t => t.value === endTime)?.label || endTime;
    return `Campaign will end on ${format(d, 'dd-MM-yyyy')} ${timeLabel}`;
  }, [endMode, endDateVal, endTime, timeOptions]);

  const resetForm = () => {
    setCurrentStep(0);
    setName('');
    setSelectedAssistant('');
    setStartMode('now');
    setStartDateVal(undefined);
    setStartTime('09:00');
    setEndMode('until_paused');
    setEndDateVal(undefined);
    setEndTime('18:00');
    setSelectedList('');
    setUploadedFile(null);
    setCreatedAudienceId(null);
    setRetryStrategy(defaultRetryStrategy);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleLaunch = async () => {
    try {
      const audienceId = selectedList || createdAudienceId;
      if (!audienceId) {
        toast({ title: 'Please select or upload a calling list', variant: 'destructive' });
        return;
      }

      await createCampaign.mutateAsync({
        campaign_name: name,
        description: name,
        agent_id: parseInt(selectedAssistant, 10),
        audience_id: audienceId,
        scheduled_start_time: getStartISO(),
      });

      toast({
        title: 'Campaign created',
        description: `${name} has been created and scheduled successfully.`,
      });
      handleClose();
    } catch {
      toast({
        title: 'Failed to create campaign',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Create an audience from the uploaded file
      try {
        const result = await createAudience.mutateAsync({
          name: file.name.replace(/\.csv$/i, ''),
          description: 'Uploaded via campaign creation',
          file,
        });
        setCreatedAudienceId(result.id);
        toast({ title: 'File uploaded', description: 'Audience created from uploaded file.' });
      } catch {
        toast({
          title: 'Upload failed',
          description: 'Failed to create audience from file.',
          variant: 'destructive',
        });
        setUploadedFile(null);
      }
    }
  };

  const formatRetryTiming = () => {
    if (retryStrategy.backoffMode === 'FIXED') {
      return `Every ${retryStrategy.minMinutesBetween}m`;
    }
    return retryStrategy.backoffMinutes.map((m) => `${m}m`).join(' → ');
  };

  // Helpers for review step
  const selectedAgentName = agents.find((a) => a.id === parseInt(selectedAssistant, 10))?.agent_name;
  const selectedAudienceName = selectedList
    ? audiences.find((a) => a.id === selectedList)?.name
    : uploadedFile?.name;
  const selectedAudienceSize = selectedList
    ? audiences.find((a) => a.id === selectedList)?.size
    : null;

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
                <Label>Select Agent *</Label>
                <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                  <SelectTrigger>
                    <SelectValue placeholder={agentsLoading ? 'Loading...' : 'Choose an agent'} />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={String(agent.id)}>
                        {agent.agent_name} ({agent.call_type === 'INCOMING' ? 'Inbound' : 'Outbound'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Section */}
              <div className="space-y-3 rounded-lg border border-border p-4">
                <Label className="text-sm font-semibold">Start</Label>
                <RadioGroup
                  value={startMode}
                  onValueChange={(v) => setStartMode(v as 'now' | 'schedule')}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="now" id="start-now" />
                    <Label htmlFor="start-now" className="font-normal cursor-pointer">Start now</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="schedule" id="start-schedule" />
                    <Label htmlFor="start-schedule" className="font-normal cursor-pointer">Schedule</Label>
                  </div>
                </RadioGroup>

                {startMode === 'schedule' && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Start date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !startDateVal && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDateVal ? format(startDateVal, 'dd-MM-yyyy') : 'dd-mm-yyyy'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDateVal}
                              onSelect={setStartDateVal}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Start time</Label>
                        <Select value={startTime} onValueChange={setStartTime}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {timeOptions.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickPicks.map((qp) => (
                        <Button
                          key={qp.label}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={qp.disabled}
                          className="text-xs h-7 px-2.5"
                          onClick={() => {
                            setStartDateVal(qp.date);
                            setStartTime(qp.time);
                          }}
                        >
                          {qp.label}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* End Section */}
              <div className="space-y-3 rounded-lg border border-border p-4">
                <Label className="text-sm font-semibold">End</Label>
                <RadioGroup
                  value={endMode}
                  onValueChange={(v) => setEndMode(v as 'until_paused' | 'end_on')}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="until_paused" id="end-paused" />
                    <Label htmlFor="end-paused" className="font-normal cursor-pointer">Run until paused</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="end_on" id="end-on" />
                    <Label htmlFor="end-on" className="font-normal cursor-pointer">End on</Label>
                  </div>
                </RadioGroup>

                {endMode === 'end_on' && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">End date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !endDateVal && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDateVal ? format(endDateVal, 'dd-MM-yyyy') : 'dd-mm-yyyy'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDateVal}
                              onSelect={setEndDateVal}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">End time</Label>
                        <Select value={endTime} onValueChange={setEndTime}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {timeOptions.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {endSummary && (
                      <p className="text-xs text-muted-foreground">{endSummary}</p>
                    )}
                  </>
                )}
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
                            {audiences.find((l) => l.id === selectedList)?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {audiences
                              .find((l) => l.id === selectedList)
                              ?.size?.toLocaleString() ?? '—'}{' '}
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
                  {/* Existing audiences selection */}
                  {audiences.length > 0 && (
                    <div className="space-y-2">
                      <Label>Select Existing List</Label>
                      <Select value={selectedList} onValueChange={(val) => {
                        setSelectedList(val);
                        setUploadedFile(null);
                        setCreatedAudienceId(null);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder={audiencesLoading ? 'Loading...' : 'Choose a list'} />
                        </SelectTrigger>
                        <SelectContent>
                          {audiences.map((audience) => (
                            <SelectItem key={audience.id} value={audience.id}>
                              {audience.name} {audience.size != null ? `(${audience.size.toLocaleString()})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-border" />
                    <span className="mx-4 text-xs text-muted-foreground">or upload a file</span>
                    <div className="flex-grow border-t border-border" />
                  </div>

                  <div
                    className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    {createAudience.isPending ? (
                      <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    )}
                    <p className="mt-3 font-medium">
                      {createAudience.isPending ? 'Uploading...' : 'Upload CSV File'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to select
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={createAudience.isPending}
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
                            onClick={() => {
                              setUploadedFile(null);
                              setCreatedAudienceId(null);
                            }}
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
                  <span className="text-muted-foreground">Agent</span>
                  <span className="font-medium">
                    {selectedAgentName || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">List</span>
                  <span className="font-medium">
                    {selectedAudienceName || '-'}
                    {selectedAudienceSize != null && ` (${selectedAudienceSize.toLocaleString()})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="font-medium">
                    {startMode === 'now' ? 'Start immediately' : (startDateVal ? `${format(startDateVal, 'dd-MM-yyyy')} ${timeOptions.find(t => t.value === startTime)?.label}` : '-')}
                    {endMode === 'end_on' && endDateVal ? ` — ${format(endDateVal, 'dd-MM-yyyy')} ${timeOptions.find(t => t.value === endTime)?.label}` : (endMode === 'until_paused' ? ' — Run until paused' : '')}
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
                currentStep === 0 && (!name || !selectedAssistant || (startMode === 'schedule' && !startDateVal))
              }
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleLaunch}
              disabled={!name || !selectedAssistant || createCampaign.isPending}
            >
              {createCampaign.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Launch Campaign'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
