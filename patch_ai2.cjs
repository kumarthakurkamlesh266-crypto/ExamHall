const fs = require('fs');
let aiContent = fs.readFileSync('src/pages/Teacher/AIAssistant.tsx', 'utf8');

const fixTarget = "double dollar signs for block math (e.g., $E = mc^2$).";
const fixReplacement = "double dollar signs for block math (e.g., $$E = mc^2$$).";
aiContent = aiContent.replace(fixTarget, fixReplacement);

fs.writeFileSync('src/pages/Teacher/AIAssistant.tsx', aiContent);
