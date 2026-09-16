const fs = require('fs');

const path = 'src/pages/Teacher/Results.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `      // 1. Fetch Assigned Students based on targetClass and section
      let studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'), where('standard', '==', String(test.targetClass)));
      if (test.section) {
        studentsQuery = query(studentsQuery, where('section', '==', test.section));
      }
      const studentsSnap = await getDocs(studentsQuery);
      const studentsData = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAssignedStudents(studentsData);`;

const replacement = `      // 1. Fetch Assigned Students based on targetClass and section
      let studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      const studentsSnap = await getDocs(studentsQuery);
      let studentsData = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // In-memory filter to support both 'standard' and 'studentClass' field variations safely
      studentsData = studentsData.filter(s => {
         const sClass = Number(s.studentClass || s.standard);
         if (sClass !== Number(test.targetClass)) return false;
         if (test.section && s.section !== test.section) return false;
         return true;
      });
      setAssignedStudents(studentsData);`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
