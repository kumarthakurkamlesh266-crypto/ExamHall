const fs = require('fs');

function patchQuery(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        `where('targetClass', '==', userData.studentClass)`,
        `where('targetClass', '==', Number(userData.studentClass || userData.standard))`
    );
    fs.writeFileSync(file, content);
}

patchQuery('src/pages/Student/Tests.tsx');
patchQuery('src/pages/Student/Overview.tsx');

let content = fs.readFileSync('src/pages/Teacher/Results.tsx', 'utf8');
content = content.replace(
    `where('studentClass', '==', Number(test.targetClass))`,
    `where('standard', '==', String(test.targetClass))` // Wait! Some users have 'standard', some 'studentClass'
);
fs.writeFileSync('src/pages/Teacher/Results.tsx', content);

