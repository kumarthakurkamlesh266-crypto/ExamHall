const fs = require('fs');

function replaceFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const { target, replacement } of replacements) {
    content = content.split(target).join(replacement);
  }
  fs.writeFileSync(path, content);
}

replaceFile('src/pages/Teacher/QuestionBank.tsx', [
  {
    target: `<Typography variant="body1" sx={{ mb: 2 }}>
                    <MathText text={q.text} />
                  </Typography>`,
    replacement: `<Box sx={{ typography: 'body1', mb: 2 }}>
                    <MathText text={q.text} />
                  </Box>`
  },
  {
    target: `<Typography key={i} variant="body2" sx={{ color: q.correctAnswers.includes(opt) ? 'success.main' : 'text.secondary', fontWeight: q.correctAnswers.includes(opt) ? 'bold' : 'normal' }}>
                          {String.fromCharCode(65 + i)}. <MathText text={opt} />
                        </Typography>`,
    replacement: `<Box key={i} sx={{ typography: 'body2', color: q.correctAnswers.includes(opt) ? 'success.main' : 'text.secondary', fontWeight: q.correctAnswers.includes(opt) ? 'bold' : 'normal', display: 'flex', gap: 1 }}>
                          <span>{String.fromCharCode(65 + i)}.</span> <MathText text={opt} />
                        </Box>`
  }
]);

replaceFile('src/pages/Teacher/AIAssistant.tsx', [
  {
    target: `<Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                      <MathText text={q.text} />
                    </Typography>`,
    replacement: `<Box sx={{ typography: 'body1', fontWeight: "bold", mb: 1 }}>
                      <MathText text={q.text} />
                    </Box>`
  },
  {
    target: `<Typography key={i} variant="body2" sx={{ color: q.correctAnswers.includes(opt) ? 'success.main' : 'text.secondary', fontWeight: q.correctAnswers.includes(opt) ? 'bold' : 'normal' }}>
                          {String.fromCharCode(65 + i)}. <MathText text={opt} />
                        </Typography>`,
    replacement: `<Box key={i} sx={{ typography: 'body2', color: q.correctAnswers.includes(opt) ? 'success.main' : 'text.secondary', fontWeight: q.correctAnswers.includes(opt) ? 'bold' : 'normal', display: 'flex', gap: 1 }}>
                          <span>{String.fromCharCode(65 + i)}.</span> <MathText text={opt} />
                        </Box>`
  }
]);

replaceFile('src/pages/Student/TakeTest.tsx', [
  {
    target: `<Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
            {idx + 1}. <MathText text={q.text} />
          </Typography>`,
    replacement: `<Box sx={{ typography: 'body1', fontWeight: "bold", mb: 2, display: 'flex', gap: 1 }}>
            <span>{idx + 1}.</span> <MathText text={q.text} />
          </Box>`
  }
]);
