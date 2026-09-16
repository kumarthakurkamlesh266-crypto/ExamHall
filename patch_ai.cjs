const fs = require('fs');

let aiContent = fs.readFileSync('src/pages/Teacher/AIAssistant.tsx', 'utf8');

const targetPrompt = `      const prompt = \`Generate \${count} multiple choice questions (MCQ) on the topic "\${topic}" with \${difficulty} difficulty. 
      Format the response strictly as a JSON array of objects. Each object must have:
      - text: The question text (use KaTeX for math if applicable, e.g. E = mc^2)
      - options: An array of 4 string options
      - correctAnswers: An array containing the exactly one correct option string
      - explanation: A short explanation
      Example: [{"text": "What is 2+2?", "options": ["3", "4", "5", "6"], "correctAnswers": ["4"], "explanation": "2+2 equals 4"}]
      Return ONLY valid JSON.\`;`;

const newPrompt = `      const prompt = \`Act as an expert examiner. Generate \${count} high-quality, thought-provoking multiple choice questions (MCQ) on the topic "\${topic}" at a \${difficulty} difficulty level.
      CRITICAL INSTRUCTIONS FOR MATH/SCIENCE:
      - You MUST format all mathematical formulas, symbols, and equations using LaTeX wrapped in single dollar signs for inline math (e.g., $F = ma$) or double dollar signs for block math (e.g., $$E = mc^2$$). 
      - Treat the output as Markdown text. Do NOT use \\text{} for normal text. Only wrap the actual math parts in $. Example: "A Carnot engine operates between $T_H = 500$ K and $T_C = 300$ K."
      - Ensure high-quality distractors (wrong options) that address common student misconceptions.
      - Keep explanations highly educational and concise.
      
      Format the response strictly as a JSON array of objects without markdown blockticks. Each object must have:
      - text: The question text
      - options: An array of 4 string options
      - correctAnswers: An array containing the exactly one correct option string
      - explanation: A detailed step-by-step reasoning
      
      Return ONLY a valid JSON array. No conversational text.\`;`;

aiContent = aiContent.replace(targetPrompt, newPrompt);
fs.writeFileSync('src/pages/Teacher/AIAssistant.tsx', aiContent);

