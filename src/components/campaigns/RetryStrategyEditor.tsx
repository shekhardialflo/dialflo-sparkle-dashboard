import { useState, useEffect } from 'react';
import { ChevronDown, Clock, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  RetryStrategy,
  RetryTemplate,
  BackoffMode,
  DayOfWeek,
  defaultRetryStrategy,
  retryTemplates,
  callStatusOptions,
  daysOfWeek,
} from '@/types/retryStrategy';

interface RetryStrategyEditorProps {
  value: RetryStrategy;
  onChange: (strategy: RetryStrategy) => void;
  campaignDispositions: string[];
  compact?: boolean;
}

export function RetryStrategyEditor({
  value,
  onChange,
  campaignDispositions,
  compact = false,
}: RetryStrategyEditorProps) {
  const [guardrailsOpen, setGuardrailsOpen] = useState(false);

  const updateStrategy = (updates: Partial<RetryStrategy>) => {
    onChange({ ...value, ...updates });
  };

  const updateTrigger = (updates: Partial<RetryStrategy['trigger']>) => {
    onChange({ ...value, trigger: { ...value.trigger, ...updates } });
  };

  const updateGuardrails = (updates: Partial<RetryStrategy['guardrails']>) => {
    onChange({ ...value, guardrails: { ...value.guardrails, ...updates } });
  };

  const toggleStatus = (status: string) => {
    const current = value.trigger.statuses || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    updateTrigger({ statuses: updated });
  };

  const toggleDisposition = (disposition: string) => {
    const current = value.trigger.dispositions || [];
    const updated = current.includes(disposition)
      ? current.filter((d) => d !== disposition)
      : [...current, disposition];
    updateTrigger({ dispositions: updated });
  };

  const toggleStopDisposition = (disposition: string) => {
    const current = value.guardrails.stopDispositions || [];
    const updated = current.includes(disposition)
      ? current.filter((d) => d !== disposition)
      : [...current, disposition];
    updateGuardrails({ stopDispositions: updated });
  };

  const toggleDay = (day: DayOfWeek) => {
    const current = value.guardrails.allowedDays || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    updateGuardrails({ allowedDays: updated });
  };

  const updateBackoffMinute = (index: number, minutes: number) => {
    const updated = [...value.backoffMinutes];
    updated[index] = Math.max(5, minutes);
    updateStrategy({ backoffMinutes: updated });
  };

  return (
    <Card className={cn(compact && 'border-0 shadow-none')}>
      <CardHeader className={cn('pb-4', compact && 'px-0 pt-0')}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">Retry Strategy</CardTitle>
            <p className="text-sm text-muted-foreground">
              Automatically re-call leads based on outcomes
            </p>
          </div>
          <Switch
            checked={value.enabled}
            onCheckedChange={(enabled) => updateStrategy({ enabled })}
          />
        </div>
      </CardHeader>

      {value.enabled && (
        <CardContent className={cn('space-y-6', compact && 'px-0 pb-0')}>
          {/* Strategy Template */}
          <div className="space-y-2">
            <Label>Strategy Template</Label>
            <Select
              value={value.template}
              onValueChange={(template: RetryTemplate) => updateStrategy({ template })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(retryTemplates).map(([key, { label, description }]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{label}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Common Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Max retries per lead</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={value.maxAttempts}
                onChange={(e) =>
                  updateStrategy({
                    maxAttempts: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Retry timing</Label>
              <Select
                value={value.backoffMode}
                onValueChange={(mode: BackoffMode) => updateStrategy({ backoffMode: mode })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed interval</SelectItem>
                  <SelectItem value="BACKOFF">Increasing intervals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timing Configuration */}
          {value.backoffMode === 'FIXED' ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Retry every</span>
              <Input
                type="number"
                min={5}
                className="w-20"
                value={value.minMinutesBetween}
                onChange={(e) =>
                  updateStrategy({
                    minMinutesBetween: Math.max(5, parseInt(e.target.value) || 30),
                  })
                }
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Retry intervals (minutes)</span>
              </div>
              <div className="flex gap-2">
                {value.backoffMinutes.map((minutes, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={5}
                      className="w-20"
                      value={minutes}
                      onChange={(e) =>
                        updateBackoffMinute(index, parseInt(e.target.value) || 15)
                      }
                    />
                    {index < value.backoffMinutes.length - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template-specific Fields */}
          <div className="space-y-3 rounded-lg border border-border/60 p-4">
            <Label className="text-sm font-medium">Triggers</Label>

            {value.template === 'NO_ANSWER' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Retry when call status is:
                </p>
                <div className="flex flex-wrap gap-2">
                  {callStatusOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                        value.trigger.statuses?.includes(option.value)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <Checkbox
                        checked={value.trigger.statuses?.includes(option.value)}
                        onCheckedChange={() => toggleStatus(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {value.template === 'DISPOSITION' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Retry when disposition is:
                </p>
                {campaignDispositions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {campaignDispositions.map((disposition) => (
                      <label
                        key={disposition}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                          value.trigger.dispositions?.includes(disposition)
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <Checkbox
                          checked={value.trigger.dispositions?.includes(disposition)}
                          onCheckedChange={() => toggleDisposition(disposition)}
                        />
                        {disposition}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    No dispositions defined for this campaign
                  </p>
                )}
              </div>
            )}

            {value.template === 'SHORT_CALL' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Retry when call duration is less than:
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={300}
                    className="w-24"
                    value={value.trigger.durationLessThanSec || 30}
                    onChange={(e) =>
                      updateTrigger({
                        durationLessThanSec: Math.min(
                          300,
                          Math.max(5, parseInt(e.target.value) || 30)
                        ),
                      })
                    }
                  />
                  <span className="text-sm text-muted-foreground">seconds</span>
                </div>
              </div>
            )}
          </div>

          {/* Guardrails (Collapsible) */}
          <Collapsible open={guardrailsOpen} onOpenChange={setGuardrailsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between p-0 hover:bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Guardrails</span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    guardrailsOpen && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              {/* Stop Conditions */}
              <div className="space-y-3">
                <Label className="text-sm">Stop conditions</Label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={value.guardrails.stopOnConverted}
                    onCheckedChange={(checked) =>
                      updateGuardrails({ stopOnConverted: !!checked })
                    }
                  />
                  <span className="text-sm">Stop when converted</span>
                </label>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">
                    Stop on these dispositions:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {campaignDispositions.map((disposition) => (
                      <label
                        key={disposition}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                          value.guardrails.stopDispositions?.includes(disposition)
                            ? 'border-destructive/50 bg-destructive/5 text-destructive'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <Checkbox
                          checked={value.guardrails.stopDispositions?.includes(disposition)}
                          onCheckedChange={() => toggleStopDisposition(disposition)}
                        />
                        {disposition}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={value.guardrails.quietHoursEnabled}
                    onCheckedChange={(checked) =>
                      updateGuardrails({ quietHoursEnabled: !!checked })
                    }
                  />
                  <span className="text-sm font-medium">Quiet hours</span>
                </label>

                {value.guardrails.quietHoursEnabled && (
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Timezone:</span>
                      <span className="font-medium text-foreground">
                        {value.guardrails.timezone}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        className="w-32"
                        value={value.guardrails.startHour}
                        onChange={(e) => updateGuardrails({ startHour: e.target.value })}
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input
                        type="time"
                        className="w-32"
                        value={value.guardrails.endHour}
                        onChange={(e) => updateGuardrails({ endHour: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Allowed days:</span>
                      <div className="flex flex-wrap gap-1">
                        {daysOfWeek.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={cn(
                              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                              value.guardrails.allowedDays?.includes(day)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  );
}
