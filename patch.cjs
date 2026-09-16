const fs = require('fs');
let content = fs.readFileSync('src/pages/Teacher/AIAssistant.tsx', 'utf8');

const target = `      const genAI = initializeGemini(userData.geminiApiKey);
      const model = genAI.models; // using the new sdk format
      const prompt = \`Generate \${count} multiple choice questions (MCQ) on the topic "\${topic}" with \${difficulty} difficulty. 
      Format the response strictly as a JSON array of objects. Each object must have:
      - text: The question text (use KaTeX for math if applicable, e.g. E = mc^2)
      - options: An array of 4 string options
      - correctAnswers: An array containing the exactly one correct option string
      - explanation: A short explanation
      Example: [{"text": "What is 2+2?", "options": ["3", "4", "5", "6"], "correctAnswers": ["4"], "explanation": "2+2 equals 4"}]
      Return ONLY valid JSON.\`;
      const response = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const text = response.text || '';`;

const replacement = `      const genAI = initializeGemini(userData.geminiApiKey);
      
      const prompt = \`Generate \${count} multiple choice questions (MCQ) on the topic "\${topic}" with \${difficulty} difficulty. 
      Format the response strictly as a JSON array of objects. Each object must have:
      - text: The question text (use KaTeX for math if applicable, e.g. E = mc^2)
      - options: An array of 4 string options
      - correctAnswers: An array containing the exactly one correct option string
      - explanation: A short explanation
      Example: [{"text": "What is 2+2?", "options": ["3", "4", "5", "6"], "correctAnswers": ["4"], "explanation": "2+2 equals 4"}]
      Return ONLY valid JSON.\`;
      
      const text = await generateWithFallback(genAI, prompt) || '';`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Teacher/AIAssistant.tsx', content);
