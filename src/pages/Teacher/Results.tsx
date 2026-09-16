import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Button, IconButton, Grid, Stack
} from '@mui/material';
import { ArrowBack, Visibility } from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';

export default function TeacherResults() {
  const { user } = useAuthStore();
  
  // Views: 'tests' | 'details'
  const [view, setView] = useState<'tests' | 'details'>('tests');
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  
  // Details state
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all tests
  useEffect(() => {
    if (!user) return;
    const fetchTests = async () => {
      setLoading(true);
      const q = query(collection(db, 'tests'), where('teacherId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTests(data.sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime()));
      setLoading(false);
    };
    if (view === 'tests') fetchTests();
  }, [user, view]);

  const handleViewTest = async (test: any) => {
    setSelectedTest(test);
    setView('details');
    setLoading(true);

    try {
      // 1. Fetch Assigned Students based on targetClass and section
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
      setAssignedStudents(studentsData);

      // 2. Fetch Results for this test
      const resultsQuery = query(collection(db, 'results'), where('testId', '==', test.id));
      const resultsSnap = await getDocs(resultsQuery);
      const resultsData = resultsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTestResults(resultsData);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (view === 'details' && selectedTest) {
    // Computations
    const submittedIds = testResults.map(r => r.studentId);
    
    // Merge assigned students and results
    let studentStatusData = assignedStudents.map(student => {
      const result = testResults.find(r => r.studentId === student.id);
      return {
        ...student,
        hasAttempted: !!result,
        score: result ? result.score : 0,
        percentage: result ? result.percentage : 0,
        submittedAt: result ? result.submittedAt : null
      };
    });

    // Also include students who submitted but might not be in the "assigned" list (e.g. class changed later)
    testResults.forEach(r => {
      if (!submittedIds.includes(r.studentId) && !studentStatusData.find(s => s.id === r.studentId)) {
        studentStatusData.push({
          id: r.studentId,
          name: r.studentName || 'Unknown',
          rollNumber: r.studentRoll || '-',
          studentClass: selectedTest.targetClass,
          hasAttempted: true,
          score: r.score,
          percentage: r.percentage,
          submittedAt: r.submittedAt
        });
      }
    });

    // Sort by percentage descending for ranking
    studentStatusData.sort((a, b) => b.percentage - a.percentage);
    
    // Assign Rank
    let currentRank = 1;
    studentStatusData = studentStatusData.map((s, index) => {
      if (!s.hasAttempted) return { ...s, rank: '-' };
      if (index > 0 && s.percentage < studentStatusData[index - 1].percentage) {
        currentRank = index + 1;
      }
      return { ...s, rank: currentRank };
    });

    const totalAssigned = studentStatusData.length;
    const totalSubmitted = testResults.length;
    const totalPending = totalAssigned - totalSubmitted;
    const avgScore = totalSubmitted > 0 ? (testResults.reduce((acc, r) => acc + r.score, 0) / totalSubmitted).toFixed(1) : 0;
    const avgPercentage = totalSubmitted > 0 ? (testResults.reduce((acc, r) => acc + r.percentage, 0) / totalSubmitted).toFixed(1) : 0;

    return (
      <Box>
        <Stack direction="row" sx={{ alignItems: "center", mb: 3, gap: 1 }}>
          <IconButton onClick={() => setView('tests')}><ArrowBack /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>Test Participation: {selectedTest.name}</Typography>
        </Stack>

        {/* Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography sx={{ color: "text.secondary" }}>Total Assigned</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary" }}>{totalAssigned}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography sx={{ color: "text.secondary" }}>Submitted</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "success.main" }}>{totalSubmitted}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography sx={{ color: "text.secondary" }}>Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "error.main" }}>{totalPending}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography sx={{ color: "text.secondary" }}>Average Score</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "info.main" }}>{avgScore} ({avgPercentage}%)</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Status Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Roll Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Test Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Marks</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Submission Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentStatusData.map((student) => (
                <TableRow key={student.id}>
                  <TableCell sx={{ fontWeight: "bold" }}>{student.rank}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>Class {student.studentClass}</TableCell>
                  <TableCell>
                    {student.hasAttempted ? (
                      <Chip label="Submitted" color="success" size="small" />
                    ) : (
                      <Chip label="Pending" color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{student.hasAttempted ? `${student.score} / ${selectedTest.totalMarks}` : '-'}</TableCell>
                  <TableCell>{student.hasAttempted ? `${student.percentage.toFixed(1)}%` : '-'}</TableCell>
                  <TableCell>{student.submittedAt ? format(student.submittedAt.toDate(), 'MMM d, yyyy h:mm a') : '-'}</TableCell>
                </TableRow>
              ))}
              {studentStatusData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: "center" }}>No students assigned to this test.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>Test Results Overview</Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Test Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Target Class</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>{test.name}</TableCell>
                <TableCell>{test.subject}</TableCell>
                <TableCell>
                  Class {test.targetClass} {test.section && `- Sec ${test.section}`}
                </TableCell>
                <TableCell>{test.createdAt ? format(test.createdAt.toDate(), 'MMM d, yyyy') : '-'}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Visibility />}
                    onClick={() => handleViewTest(test)}
                  >
                    View Report
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tests.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center" }}>No tests created yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
