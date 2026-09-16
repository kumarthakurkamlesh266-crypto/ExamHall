const fs = require('fs');

const path = 'src/pages/Teacher/AIAssistant.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Explanation: {q.explanation}
                    </Typography>`;
const replacement = `<Box sx={{ typography: 'caption', color: "text.secondary", mt: 2, display: 'block' }}>
                      <strong>Explanation:</strong> <MathText text={q.explanation} />
                    </Box>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log('Patched AIAssistant.tsx explanation');
} else {
  console.log('Target not found in AIAssistant.tsx, trying fuzzy replacement');
  // fallback for fuzzy matching
  const targetFuzzy = `Explanation: {q.explanation}`;
  if (content.includes(targetFuzzy)) {
      console.log('Found fuzzy match');
  } else {
      console.log('Fuzzy match not found either');
  }
}
