import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface OCRResult {
  quality_flags: { blur: boolean; small: boolean; dirty: boolean; angled: boolean; weather?: boolean };
  applied_fixers: string[];
  ocr_results: { final_text: string; confidence: number; matched_regex_format: boolean };
}

export const OCRPipelineView = ({ result }: { result: OCRResult }) => {
  return (
    <div className="cc-panel p-4 flex flex-col space-y-4">
      <span className="cc-header border-b border-[var(--cc-panel-border)] pb-2">OCR PIPELINE EXECUTION</span>
      
      <div className="flex items-center justify-between">
        {/* Step 1: Raw Crop */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-12 bg-[#050a11] border border-[var(--cc-panel-border)] flex items-center justify-center relative overflow-hidden">
            <span className="text-gray-600 font-mono text-xs">RAW CROP</span>
            {(result.quality_flags.blur || result.quality_flags.dirty || result.quality_flags.weather) && (
              <div className={`absolute inset-0 ${result.quality_flags.weather ? 'bg-blue-300/30 backdrop-blur-[3px]' : 'bg-white/5 backdrop-blur-[2px]'}`} />
            )}
          </div>
          <span className="text-[10px] text-gray-500 mt-2 uppercase">Input</span>
        </div>

        <ArrowRight size={16} className="text-[var(--cc-panel-border)]" />

        {/* Step 2: Fixers */}
        <div className="flex flex-col items-center">
          <div className="flex space-x-1">
            {result.applied_fixers.length === 0 ? (
              <span className="text-[10px] text-[var(--cc-success)] font-mono border border-[var(--cc-success)] px-2 py-1">CLEAN</span>
            ) : (
              result.applied_fixers.map(f => (
                <span key={f} className="text-[10px] text-[var(--cc-warning)] font-mono border border-[var(--cc-warning)] px-2 py-1 bg-[var(--cc-warning-dim)]">
                  {f.toUpperCase()}
                </span>
              ))
            )}
          </div>
          <span className="text-[10px] text-gray-500 mt-2 uppercase">Fixers Applied</span>
        </div>

        <ArrowRight size={16} className="text-[var(--cc-panel-border)]" />

        {/* Step 3: Result */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-12 bg-[#050a11] border border-[var(--cc-primary)] flex items-center justify-center relative">
            <span className="cc-value text-[var(--cc-primary)] text-lg">{result.ocr_results.final_text}</span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-[10px] text-gray-500 uppercase">Confidence</span>
            <span className="text-[10px] cc-value text-white">{Math.round(result.ocr_results.confidence * 100)}%</span>
            {result.ocr_results.matched_regex_format ? (
              <CheckCircle2 size={12} className="text-[var(--cc-success)]" />
            ) : (
              <AlertTriangle size={12} className="text-[var(--cc-danger)]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
