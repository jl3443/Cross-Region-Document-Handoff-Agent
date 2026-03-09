import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileJson, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Scenario } from '../../data/types';

interface ScenarioUploadModalProps {
  onClose: () => void;
  onImport: (scenario: Scenario) => void;
}

const requiredFields = ['id', 'name', 'shipment', 'documents', 'exceptions', 'globalTimeline'] as const;

function validateScenario(data: unknown): { valid: boolean; error?: string; scenario?: Scenario } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON: expected an object.' };
  }
  const obj = data as Record<string, unknown>;
  for (const field of requiredFields) {
    if (!(field in obj)) {
      return { valid: false, error: `Missing required field: "${field}".` };
    }
  }
  if (typeof obj.id !== 'string' || typeof obj.name !== 'string') {
    return { valid: false, error: 'Fields "id" and "name" must be strings.' };
  }
  if (!Array.isArray(obj.documents) || !Array.isArray(obj.exceptions) || !Array.isArray(obj.globalTimeline)) {
    return { valid: false, error: 'Fields "documents", "exceptions", and "globalTimeline" must be arrays.' };
  }
  return { valid: true, scenario: data as Scenario };
}

export function ScenarioUploadModal({ onClose, onImport }: ScenarioUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ name: string; shipmentId: string; docCount: number; excCount: number } | null>(null);
  const [parsedScenario, setParsedScenario] = useState<Scenario | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
    setPreview(null);
    setParsedScenario(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const result = validateScenario(json);
        if (!result.valid) {
          setError(result.error!);
          return;
        }
        const sc = result.scenario!;
        // Ensure defaults for optional fields
        if (!sc.warRoom) sc.warRoom = false;
        if (!sc.matchingSummary) {
          sc.matchingSummary = {
            totalRequired: sc.documents.length,
            received: sc.documents.filter((d) => d.status !== 'missing' && d.status !== 'pending').length,
            matched: sc.documents.filter((d) => d.status === 'validated').length,
            exceptionsDetected: sc.exceptions.length,
            blockingIssues: sc.exceptions.filter((ex) => ex.blocking).length,
          };
        }
        setParsedScenario(sc);
        setPreview({
          name: sc.name,
          shipmentId: sc.shipment?.id ?? 'N/A',
          docCount: sc.documents.length,
          excCount: sc.exceptions.length,
        });
      } catch {
        setError('Failed to parse JSON. Please check the file format.');
      }
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && f.name.endsWith('.json')) {
        processFile(f);
      } else {
        setError('Please drop a .json file.');
      }
    },
    [processFile]
  );

  return (
    <>
      <motion.div
        key="scenario-upload-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30"
        onClick={onClose}
      />
      <motion.div
        key="scenario-upload-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-[#0000B3]" />
              <h3 className="text-sm font-semibold text-slate-800">Import Scenario</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-[#0000B3] bg-blue-50/50'
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {file ? file.name : 'Drop .json file here or click to browse'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Scenario JSON file</p>
              <input
                ref={inputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processFile(f);
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Valid Scenario</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Name:</span>{' '}
                    <span className="font-medium text-slate-700">{preview.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Shipment:</span>{' '}
                    <span className="font-mono font-medium text-slate-700">{preview.shipmentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Documents:</span>{' '}
                    <span className="font-medium text-slate-700">{preview.docCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Exceptions:</span>{' '}
                    <span className="font-medium text-slate-700">{preview.excCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (parsedScenario) {
                  onImport(parsedScenario);
                  onClose();
                }
              }}
              disabled={!parsedScenario}
              className="rounded-md bg-[#0000B3] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#0000CC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Import Scenario
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
