import { useState } from 'react';
import { Upload, FileText, Link2, PenLine, Sparkles, GitBranch, AlertTriangle, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UploadRecordingsProps {
  onAnalyze: () => void;
}

export function UploadRecordings({ onAnalyze }: UploadRecordingsProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const features = [
    { icon: Sparkles, label: 'Scenario clusters', desc: 'Group similar conversations automatically' },
    { icon: GitBranch, label: 'Call flows', desc: 'Decision trees for each scenario' },
    { icon: AlertTriangle, label: 'Edge cases', desc: 'Unusual patterns & objections' },
    { icon: Layers, label: 'Agent-ready structure', desc: 'Ready to build your voice agent' },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Upload Call Recordings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a ZIP of call recordings or individual audio files. We'll analyze them to discover conversation scenarios.
          </p>
        </div>

        {/* Drop zone */}
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer',
            dragOver
              ? 'border-secondary bg-secondary/5'
              : 'border-border hover:border-secondary/40 hover:bg-muted/30'
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".zip,.mp3,.wav,.m4a,.ogg,.webm"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 mb-4">
            <Upload className="h-6 w-6 text-secondary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Drop ZIP or audio files here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports .zip, .mp3, .wav, .m4a, .ogg, .webm
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{files.length} file(s) selected</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <span className="ml-auto shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secondary options */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: FileText, label: 'Upload documents', desc: 'PDF, DOCX, TXT' },
            { icon: Link2, label: 'Add URLs', desc: 'Paste links to recordings' },
            { icon: PenLine, label: 'Manual context', desc: 'Describe your use case' },
          ].map((opt) => (
            <Card key={opt.label} className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardContent className="flex items-center gap-3 p-3">
                <opt.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-foreground">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={onAnalyze}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze Calls
        </Button>
      </div>

      {/* Right panel - what we generate */}
      <div className="lg:col-span-2">
        <Card className="sticky top-6">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">What we'll generate</h3>
            <div className="space-y-3">
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <f.icon className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
