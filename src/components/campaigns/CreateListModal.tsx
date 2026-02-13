import { useState } from 'react';
import { Upload, FileSpreadsheet, X, Loader2 } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCreateAudience } from '@/hooks/use-campaigns';

interface CreateListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListModal({ open, onOpenChange }: CreateListModalProps) {
  const { toast } = useToast();
  const createAudience = useCreateAudience();
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const resetForm = () => {
    setName('');
    setTags('');
    setUploadedFile(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreate = async () => {
    try {
      await createAudience.mutateAsync({
        name,
        description: tags || undefined,
        file: uploadedFile || undefined,
      });
      toast({
        title: 'List created',
        description: `${name} has been created successfully.`,
      });
      handleClose();
    } catch {
      toast({
        title: 'Failed to create list',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create List</DialogTitle>
          <DialogDescription>Upload a CSV file to create a new contact list</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">List Name *</Label>
            <Input
              id="list-name"
              placeholder="e.g., Q1 Sales Leads"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="list-tags">Tags (comma separated)</Label>
            <Input
              id="list-tags"
              placeholder="e.g., sales, q1, outbound"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {!uploadedFile ? (
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary"
              onClick={() => document.getElementById('list-file-upload')?.click()}
            >
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">Upload CSV File</p>
              <p className="text-sm text-muted-foreground">Drag and drop or click to select</p>
              <input
                id="list-file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
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
                  <Button variant="ghost" size="icon" onClick={() => setUploadedFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name || !uploadedFile || createAudience.isPending}
          >
            {createAudience.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create List'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
