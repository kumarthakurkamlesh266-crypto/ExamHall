import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Chip } from '@mui/material';
import { PlayArrow, Assignment } from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function StudentTests() {
  const { userData } = useAuthStore();
  const [tests, setTests] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;
    const fetchTests = async () => {
      // Find tests matching student class
      const q = query(collection(db, 'tests'), where('targetClass', '==', userData.studentClass));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTests(data);
    };
    fetchTests();
  }, [userData]);

  const isTestActive = (startDate: string, endDate: string) => {
    const now = new Date();
    return now >= new Date(startDate) && now <= new Date(endDate);
  };

  const isUpcoming = (startDate: string) => {
    return new Date() < new Date(startDate);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={4}>Available Tests</Typography>

      <Grid container spacing={3}>
        {tests.map(test => {
          const active = isTestActive(test.startDate, test.endDate);
          const upcoming = isUpcoming(test.startDate);
          
          return (
            <Grid xs={12} sm={6} md={4} key={test.id}>
              <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Chip 
                    label={active ? 'Active Now' : (upcoming ? 'Upcoming' : 'Ended')} 
                    color={active ? 'success' : (upcoming ? 'primary' : 'default')}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {test.duration} mins
                  </Typography>
                </Box>
                
                <Typography variant="h6" fontWeight="bold" mb={1}>{test.name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Subject: {test.subject}
                </Typography>
                
                <Box mb={3} flexGrow={1}>
                  <Typography variant="body2">
                    <strong>Starts:</strong> {format(new Date(test.startDate), 'MMM d, h:mm a')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Ends:</strong> {format(new Date(test.endDate), 'MMM d, h:mm a')}
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    <strong>Marks:</strong> {test.totalMarks}
                  </Typography>
                </Box>

                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<PlayArrow />}
                  disabled={!active}
                  onClick={() => navigate(`/student/take-test/${test.id}`)}
                >
                  Start Test
                </Button>
              </Paper>
            </Grid>
          );
        })}
        {tests.length === 0 && (
          <Grid xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6">No Tests Available</Typography>
              <Typography color="text.secondary">There are currently no tests scheduled for your class.</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
