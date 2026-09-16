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
    target: `<Box display="flex" justifyContent="space-between">`,
    replacement: `<Box sx={{ display: "flex", justifyContent: "space-between" }}>`
  }
]);

replaceFile('src/pages/Student/TakeTest.tsx', [
  {
    target: `if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;`,
    replacement: `if (loading) return <Box p={4} sx={{ display: "flex", justifyContent: "center" }}><CircularProgress /></Box>;`
  },
  {
    target: `<Box display="flex" justifyContent="flex-end" mt={4}>`,
    replacement: `<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>`
  }
]);

replaceFile('src/pages/Student/Tests.tsx', [
  {
    target: `<Box display="flex" justifyContent="space-between" mb={2}>`,
    replacement: `<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>`
  }
]);

replaceFile('src/pages/Teacher/AIAssistant.tsx', [
  {
    target: `<Paper sx={{ p: 3, borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>`,
    replacement: `<Paper sx={{ p: 3, borderRadius: 2, display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>`
  }
]);

