const fs = require('fs');

function replaceFile(path, target, replacement) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
}

replaceFile('src/pages/Teacher/QuestionBank.tsx',
  '<Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>',
  '<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>');

replaceFile('src/pages/Teacher/QuestionBank.tsx',
  '<Box key={i} display="flex" gap={2} mb={2} alignItems="center">',
  '<Box key={i} sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>');

replaceFile('src/pages/Teacher/CreateTest.tsx',
  '<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>',
  '<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>');

replaceFile('src/pages/Teacher/CreateTest.tsx',
  '<Box key={q.id} display="flex" alignItems="flex-start" mb={1} p={1} border={1} borderColor="divider" borderRadius={1}>',
  '<Box key={q.id} sx={{ display: "flex", alignItems: "flex-start", mb: 1, p: 1, border: 1, borderColor: "divider", borderRadius: 1 }}>');

replaceFile('src/pages/Teacher/Results.tsx',
  '<Stack direction="row" alignItems="center" mb={3} gap={1}>',
  '<Stack direction="row" sx={{ alignItems: "center", mb: 3, gap: 1 }}>');

replaceFile('src/pages/Teacher/AIAssistant.tsx',
  '<Grid container spacing={3} alignItems="center">',
  '<Grid container spacing={3} sx={{ alignItems: "center" }}>');
