const fs = require('fs');

function replaceFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const { target, replacement } of replacements) {
    // split by target or use regex if needed
    // simpler: use split/join for all occurrences
    content = content.split(target).join(replacement);
  }
  fs.writeFileSync(path, content);
}

// 1. QuestionBank.tsx
let qbContent = fs.readFileSync('src/pages/Teacher/QuestionBank.tsx', 'utf8');
qbContent = qbContent.replace(/import \{ InlineMath, BlockMath \} from 'react-katex';/, "import MathText from '../../components/MathText';");
qbContent = qbContent.replace(/<InlineMath math=\{q\.text\} renderError=\{\(err\) => <span>\{q\.text\}<\/span>\} \/>/g, "<MathText text={q.text} />");
qbContent = qbContent.replace(/<InlineMath math=\{opt\} renderError=\{\(\) => <span>\{opt\}<\/span>\} \/>/g, "<MathText text={opt} />");
fs.writeFileSync('src/pages/Teacher/QuestionBank.tsx', qbContent);

// 2. CreateTest.tsx
let ctContent = fs.readFileSync('src/pages/Teacher/CreateTest.tsx', 'utf8');
ctContent = ctContent.replace(/import \{ InlineMath, BlockMath \} from 'react-katex';/, "import MathText from '../../components/MathText';");
ctContent = ctContent.replace(/<InlineMath math=\{q\.text\.length > 60 \? q\.text\.substring\(0, 60\) \+ '\.\.\.' : q\.text\} renderError=\{\(\) => <span>\{q\.text\}<\/span>\} \/>/g, "<MathText text={q.text.length > 60 ? q.text.substring(0, 60) + '...' : q.text} />");
fs.writeFileSync('src/pages/Teacher/CreateTest.tsx', ctContent);

// 3. AIAssistant.tsx
let aiContent = fs.readFileSync('src/pages/Teacher/AIAssistant.tsx', 'utf8');
aiContent = aiContent.replace(/import \{ InlineMath \} from 'react-katex';/, "import MathText from '../../components/MathText';");
aiContent = aiContent.replace(/<InlineMath math=\{q\.text\} renderError=\{\(\) => <span>\{q\.text\}<\/span>\} \/>/g, "<MathText text={q.text} />");
aiContent = aiContent.replace(/<InlineMath math=\{opt\} renderError=\{\(\) => <span>\{opt\}<\/span>\} \/>/g, "<MathText text={opt} />");
fs.writeFileSync('src/pages/Teacher/AIAssistant.tsx', aiContent);

// 4. TakeTest.tsx
let ttContent = fs.readFileSync('src/pages/Student/TakeTest.tsx', 'utf8');
ttContent = ttContent.replace(/import \{ InlineMath \} from 'react-katex';/, "import MathText from '../../components/MathText';");
ttContent = ttContent.replace(/<InlineMath math=\{q\.text\} renderError=\{\(\) => <span>\{q\.text\}<\/span>\} \/>/g, "<MathText text={q.text} />");
ttContent = ttContent.replace(/<InlineMath math=\{opt\} renderError=\{\(\) => <span>\{opt\}<\/span>\} \/>/g, "<MathText text={opt} />");
fs.writeFileSync('src/pages/Student/TakeTest.tsx', ttContent);

