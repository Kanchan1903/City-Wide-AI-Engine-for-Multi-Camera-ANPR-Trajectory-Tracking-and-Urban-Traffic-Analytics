import os

file_path = "d:/SIH_2026/frontend/src/pages/ANPRDemo.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "} catch (fetchErr) {" in line:
        new_lines.append("  } catch (fetchErr: any) {\n")
        new_lines.append("  clearTimeout(timeoutId);\n")
        new_lines.append("  console.error(\"Backend API request timed out or unavailable.\", fetchErr);\n")
        new_lines.append("  data = [{\n")
        new_lines.append("  processing_mode: \"FAILED\",\n")
        new_lines.append("  raw_ocr_text: \"Failed to connect to the backend API or request timed out.\"\n")
        new_lines.append("  }];\n")
        new_lines.append("  }\n\n")
        new_lines.append("  if (data && data.length === 0) {\n")
        new_lines.append("     data = [{ processing_mode: \"FAILED\", raw_ocr_text: \"No license plates detected in the image.\" }];\n")
        new_lines.append("  }\n")
        skip = True
        continue
    
    if skip and "setResults(data);" in line:
        skip = False
        new_lines.append(line)
        continue
        
    if not skip:
        new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Replaced catch block.")
 