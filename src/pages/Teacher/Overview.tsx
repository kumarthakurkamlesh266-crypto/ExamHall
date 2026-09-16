import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Stack, Grid } from '@mui/material';
import { People, Assignment, LibraryBooks, CheckCircle, Add, AutoFixHigh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';

const StatCard = ({ title, value, icon, color }: any) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 3, borderLeft: 6, borderColor: color }}>
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${color}15`, color }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>{value}</Typography>
    </Box>
  </Paper>
);

export default function TeacherOverview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [completedTests, setCompletedTests] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    // Total Students
    const unsubscribeStudents = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), (snap) => {
      setTotalStudents(snap.size);
    });

    // Total Tests
    const qTests = query(collection(db, 'tests'), where('teacherId', '==', user.uid));
    const unsubscribeTests = onSnapshot(qTests, (snap) => {
      setTotalTests(snap.size);
    });

    // Total Questions
    const qQuestions = query(collection(db, 'questions'), where('teacherId', '==', user.uid));
    const unsubscribeQuestions = onSnapshot(qQuestions, (snap) => {
      setTotalQuestions(snap.size);
    });

    // Completed Tests (Results)
    const qResults = query(collection(db, 'results'), where('teacherId', '==', user.uid));
    const unsubscribeResults = onSnapshot(qResults, (snap) => {
      setCompletedTests(snap.size);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeTests();
      unsubscribeQuestions();
      unsubscribeResults();
    };
  }, [user?.uid]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>Dashboard Overview</Typography>
      
      <Grid container spacing={3} mb={6}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Students" value={totalStudents} icon={<People fontSize="large" />} color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Tests" value={totalTests} icon={<Assignment fontSize="large" />} color="#8b5cf6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Questions" value={totalQuestions} icon={<LibraryBooks fontSize="large" />} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Completed Tests" value={completedTests} icon={<CheckCircle fontSize="large" />} color="#10b981" />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>Quick Actions</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => navigate('/teacher/create-test')}
          sx={{ py: 1.5, px: 3, borderRadius: 2 }}
        >
          Create New Test
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<AutoFixHigh />} 
          onClick={() => navigate('/teacher/ai-assistant')}
          sx={{ py: 1.5, px: 3, borderRadius: 2 }}
        >
          Generate with AI
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Add />} 
          onClick={() => navigate('/teacher/questions')}
          sx={{ py: 1.5, px: 3, borderRadius: 2 }}
        >
          Add Question
        </Button>
      </Stack>
    </Box>
  );
}
