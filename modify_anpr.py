import re

file_path = "d:/SIH_2026/frontend/src/pages/ANPRDemo.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove Demo Mode Ready Badge
content = re.sub(
    r'<Badge variant="warning"[^>]*>\s*Demo Mode Ready\s*</Badge>',
    '',
    content
)

# 2. Replace the Results panel
# Find the start of the `<>` inside `res.processing_mode === 'FAILED' ? ... : (<>`
# and the end of `{/* Action Links */}`
start_marker = "                <>\n"
end_marker = "                </>\n              )}\n            </Card>"

replacement = """                <>
                  <div className="flex flex-col gap-6 py-4">
                    <div className="w-full flex justify-center">
                      <div className="h-24 md:h-32 bg-slate-900 rounded border border-slate-800 overflow-hidden relative inline-block">
                        {(selectedFile && selectedFile.type.startsWith('image')) ? (
                          <img src={previewUrl || ''} className="h-full w-auto object-contain opacity-90" alt="Crop" />
                        ) : (
                          <img src="/anpr_plate_crop.png" className="h-full w-auto object-contain opacity-90" alt="Crop" />
                        )}
                        <div className="absolute inset-0 border-2 border-blue-500/50 m-1 rounded shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight mb-2">{res.plate_number}</div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        OCR Confidence: <span className={`${res.confidence_level === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>{(res.overall_confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>"""

# Using regex to replace everything from `<>` to `</>`
pattern = r'<\>[\s\S]*?<\/>\s*\)\}\s*<\/Card>'

content = re.sub(pattern, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modifications applied successfully.")
 