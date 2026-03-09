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
  if (!data || typeof data !== 'object') return { valid: false, error: 'Invalid JSON: expected an object.' };
  const obj = data as Record<string, unknown>;
  for (const field of requiredFields) {
    if (!(field in obj)) return { valid: false, error: `Missing required field: "${field}".` };
  }
  if (typeof obj.id !== 'string' || typeof obj.name !== 'string')
    return { valid: false, error: 'Fields "id" and "name" must be strings.' };
  if (!Array.isArray(obj.documents) || !Array.isArray(obj.exceptions) || !Array.isArray(obj.globalTimeline))
    return { valid: false, error: 'Fields "documents", "exceptions", and "globalTimeline" must be arrays.' };
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
        if (!result.valid) { setError(result.error!); return; }
        const sc = result.scenario!;
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
        setPreview({ name: sc.name, shipmentId: sc.shipment?.id ?? 'N/A', docCount: sc.documents.length, excCount: sc.exceptions.length });
      } catch {
        setError('Failed to parse JSON. Please check the file format.');
      }
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.json')) processFile(f);
    else setError('Please drop a .json file.');
  }, [processFile]);

  return (
    <>
      <motion.div
        key="scenario-upload-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        key="scenario-upload-modal"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md rounded-2xl bg-[#111111] border border-neutral-800 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                <FileJson className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Import Scenario</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-white transition-colors"
            >
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
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : file
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/30'
              }`}
            >
              <Upload className="h-8 w-8 text-neutral-600 mb-3" />
              <p className="text-sm font-medium text-neutral-300">
                {file ? file.name : 'Drop .json file here or click to browse'}
              </p>
              <p className="text-xs text-neutral-600 mt-1">Scenario JSON file</p>
              <input
                ref={inputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Valid Scenario</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Name', value: preview.name },
                    { label: 'Shipment', value: preview.shipmentId },
                    { label: 'Documents', value: String(preview.docCount) },
                    { label: 'Exceptions', value: String(preview.excCount) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-neutral-500">{label}:</span>{' '}
                      <span className="font-medium text-neutral-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-neutral-800 px-6 py-3">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (parsedScenario) { onImport(parsedScenario); onClose(); } }}
              disabled={!parsedScenario}
              className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Import Scenario
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
