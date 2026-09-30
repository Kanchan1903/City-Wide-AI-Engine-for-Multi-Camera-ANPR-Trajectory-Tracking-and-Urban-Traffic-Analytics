import re

file_path = "d:/SIH_2026/frontend/src/pages/ANPRDemo.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace the catch (fetchErr) block to remove DEMO fallback
catch_pattern = r'\} catch \(fetchErr\) \{[\s\S]*?\}\n\n  setResults\(data\);'

catch_replacement = """} catch (fetchErr: any) {
 clearTimeout(timeoutId);
 console.error("Backend API request timed out or unavailable.", fetchErr);
 data = [{
 processing_mode: "FAILED",
 raw_ocr_text: "Failed to connect to the backend API or request timed out."
 }];
 }
 
 if (data && data.length === 0) {
    data = [{ processing_mode: "FAILED", raw_ocr_text: "No license plates detected in the image." }];
 }

 setResults(data);"""

content = re.sub(catch_pattern, catch_replacement, content)

# 2. Update the Results panel to handle empty plate_number and correct OCR confidence display
results_pattern = r'<div className="text-center">[\s\S]*?</div>\s*</div>\s*</>'

results_replacement = """<div className="text-center">
                      <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight mb-2">
                        {res.plate_number ? res.plate_number : <span className="text-2xl text-slate-500 font-sans tracking-normal">Plate not recognized</span>}
                      </div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        OCR Confidence: <span className={`${res.confidence_level === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {res.ocr_confidence != null ? (res.ocr_confidence * 100).toFixed(1) : "0.0"}%
                        </span>
                      </div>
                    </div>
                  </div>
                </>"""

content = re.sub(results_pattern, results_replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modifications applied successfully.")
