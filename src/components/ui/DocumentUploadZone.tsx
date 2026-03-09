import { useState, useCallback, useRef } from 'react';
import { Upload, CheckCircle2, Loader2 } from 'lucide-react';

interface DocumentUploadZoneProps {
  compact?: boolean;
  onUploadComplete?: () => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'done';

export function DocumentUploadZone({ compact, onUploadComplete }: DocumentUploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback(
    (name: string) => {
      setFileName(name);
      setState('uploading');
      setProgress(0);

      // Fake progress 0→100 over 2 seconds
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 5;
        });
      }, 100);

      // After 2s → processing state
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setState('processing');

        // After 1.5s → done
        setTimeout(() => {
          setState('done');
          onUploadComplete?.();

          // After 2s → reset
          setTimeout(() => {
            setState('idle');
            setFileName('');
            setProgress(0);
          }, 2000);
        }, 1500);
      }, 2000);
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) simulateUpload(f.name);
    },
    [simulateUpload]
  );

  if (state === 'done') {
    return (
      <div className={`rounded-xl border border-emerald-500/20 bg-emerald-500/10 ${compact ? 'px-3 py-2.5' : 'px-4 py-4'} flex items-center gap-2`}>
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-emerald-400">{fileName}</p>
          <p className="text-[10px] text-emerald-500">Document received — processing with AI...</p>
        </div>
      </div>
    );
  }

  if (state === 'uploading' || state === 'processing') {
    return (
      <div className={`rounded-xl border border-neutral-800 bg-neutral-900/50 ${compact ? 'px-3 py-2.5' : 'px-4 py-4'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
          <span className="text-xs font-medium text-white">
            {state === 'uploading' ? `Uploading ${fileName}...` : 'AI processing document...'}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-200"
            style={{ width: `${state === 'processing' ? 100 : progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
        isDragOver
          ? 'border-blue-500 bg-blue-500/5'
          : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/30'
      } ${compact ? 'px-3 py-3' : 'px-4 py-6'} flex flex-col items-center`}
    >
      <Upload className={`text-neutral-500 ${compact ? 'h-5 w-5 mb-1' : 'h-6 w-6 mb-2'}`} />
      <p className={`font-medium text-neutral-300 ${compact ? 'text-[11px]' : 'text-xs'}`}>
        Drop documents here
      </p>
      <p className="text-[10px] text-neutral-600 mt-0.5">Supports PDF, XLSX, images</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) simulateUpload(f.name);
        }}
      />
    </div>
  );
}
