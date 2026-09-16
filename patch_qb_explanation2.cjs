const fs = require('fs');

const path = 'src/pages/Teacher/QuestionBank.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                    </Box>
                  )}
                </Box>
                <IconButton color="error" onClick={async () => {`;

const replacement = `                    </Box>
                  )}
                  {q.explanation && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1, typography: 'caption', color: 'text.secondary', display: 'block' }}>
                      <strong>Explanation:</strong> <MathText text={q.explanation} />
                    </Box>
                  )}
                </Box>
                <IconButton color="error" onClick={async () => {`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log('Patched QuestionBank.tsx explanation again');
} else {
  console.log('Target still not found');
}
