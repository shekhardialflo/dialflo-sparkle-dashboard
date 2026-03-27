import { useState } from 'react';
import { Phone, Copy, Check, Plus, X } from 'lucide-react';
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
import type { CallAgentResponse } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

interface TestCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: CallAgentResponse | null;
}

export function TestCallModal({ open, onOpenChange, agent }: TestCallModalProps) {
  const { toast } = useToast();
  const [calleePhone, setCalleePhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [contextVars, setContextVars] = useState<{ key: string; value: string }[]>([]);

  if (!agent) return null;

  const addContextVar = () => {
    setContextVars([...contextVars, { key: '', value: '' }]);
  };

  const removeContextVar = (index: number) => {
    setContextVars(contextVars.filter((_, i) => i !== index));
  };

  const updateContextVar = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...contextVars];
    updated[index][field] = val;
    setContextVars(updated);
  };

  const handleStartCall = () => {
    toast({
      title: 'Test call initiated',
      description: `Starting test call with ${agent.agent_name}`,
    });
    onOpenChange(false);
  };

  const contextObj = Object.fromEntries(
    contextVars.filter((v) => v.key).map((v) => [v.key, v.value])
  );

  const handleCopyCurl = () => {
    const curl = `curl -X POST 'https://api.dialflo.com/v1/calls' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "assistant_id": ${agent.id},
    "phone_number": "${calleePhone}"${Object.keys(contextObj).length > 0 ? `,\n    "context": ${JSON.stringify(contextObj, null, 4)}` : ''}
  }'`;
    
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'cURL command copied successfully.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Test {agent.agent_name}</DialogTitle>
          <DialogDescription>
            Start a test call to verify your agent is working correctly
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="callee-phone">Callee Phone</Label>
            <Input
              id="callee-phone"
              placeholder="+91 9876543210"
              value={calleePhone}
              onChange={(e) => setCalleePhone(e.target.value)}
            />
          </div>

          {/* Call Context Variables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Call Context</Label>
              <Button variant="outline" size="sm" onClick={addContextVar}>
                <Plus className="mr-1 h-3 w-3" />
                Add Variable
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add variables like source, city, etc. that your agent can use during the call.
            </p>
            {contextVars.length > 0 && (
              <div className="space-y-2">
                {contextVars.map((v, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Variable name"
                      value={v.key}
                      onChange={(e) => updateContextVar(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value"
                      value={v.value}
                      onChange={(e) => updateContextVar(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeContextVar(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleStartCall} className="flex-1">
              <Phone className="mr-2 h-4 w-4" />
              Start Test Call
            </Button>
            <Button variant="outline" onClick={handleCopyCurl}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy cURL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
