const fs = require('fs');
let code = fs.readFileSync('src/components/TopNav.tsx', 'utf8');

// Replace imports
code = code.replace(
  /import { Shield } from 'lucide-react';/, 
  "import { Shield, Sun, Moon } from 'lucide-react';\nimport { useStore } from '../store/store';"
);

// Add hooks
code = code.replace(
  /const navigate = useNavigate\(\);/,
  "const navigate = useNavigate();\n const theme = useStore((state) => state.theme);\n const toggleTheme = useStore((state) => state.toggleTheme);"
);

// Add button
code = code.replace(
  /<div className="flex items-center justify-end shrink-0 ml-2 lg:ml-4">/,
  `<div className="flex items-center justify-end shrink-0 ml-2 lg:ml-4 gap-3">
  <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-all flex items-center justify-center">
    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
  </button>`
);

fs.writeFileSync('src/components/TopNav.tsx', code);
console.log('Modified TopNav.tsx');
