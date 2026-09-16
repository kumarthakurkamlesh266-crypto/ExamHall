import { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Add, AutoFixHigh, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardAnalytics from '../../components/DashboardAnalytics';
import { format } from 'date-fns';

export default function TeacherOverview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recentTests, setRecentTests] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchRecentTests = async () => {
      try {
        const q = query(collection(db, 'tests'), where('teacherId', '==', user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory since we might not have a composite index for where() + orderBy()
        data.sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime());
        setRecentTests(data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecentTests();
  }, [user]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>Dashboard Overview</Typography>
      
      <DashboardAnalytics />

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, mt: 4 }}>Quick Actions</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={5}>
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

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>Recently Created Tests</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Test Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Target Class</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>{test.name}</TableCell>
                <TableCell>
                  <Chip size="small" label={`Class ${test.targetClass} ${test.section ? '- ' + test.section : ''}`} />
                </TableCell>
                <TableCell>{test.createdAt ? format(test.createdAt.toDate(), 'MMM d, yyyy') : '-'}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Visibility />}
                    onClick={() => navigate('/teacher/results')}
                  >
                    View Results
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {recentTests.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", py: 3 }}>
                  No tests created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
}
