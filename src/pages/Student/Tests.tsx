import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Chip, Skeleton } from '@mui/material';
import { PlayArrow, Assignment } from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function StudentTests() {
  const { userData } = useAuthStore();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;
    const fetchTests = async () => {
      // Find tests matching student class
      const q = query(collection(db, 'tests'), where('targetClass', '==', Number(userData.studentClass || userData.standard)));
      const snap = await getDocs(q);
      
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter by section and stream if they are set on the test
      data = data.filter(test => {
        if (test.section && test.section !== userData.section) return false;
        if (test.stream && test.stream !== userData.stream) return false;
        return true;
      });

      setTests(data);
      setLoading(false);
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
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>Available Tests</Typography>
      <Grid container spacing={3}>
        {loading && (
          <>
            {[1, 2, 3].map((n) => (
              <Grid key={n} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="text" width={40} />
                  </Box>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
                  <Box mb={3} flexGrow={1}>
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
                  </Box>
                  <Skeleton variant="rounded" width="100%" height={36} />
                </Paper>
              </Grid>
            ))}
          </>
        )}
        {!loading && tests.map(test => {
          const active = isTestActive(test.startDate, test.endDate);
          const upcoming = isUpcoming(test.startDate);
          
          return (
            <Grid key={test.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Chip 
                    label={active ? 'Active Now' : (upcoming ? 'Upcoming' : 'Ended')} 
                    color={active ? 'success' : (upcoming ? 'primary' : 'default')}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {test.duration} mins
                  </Typography>
                </Box>
                
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>{test.name}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Subject: {test.subject}
                </Typography>
                
                <Box mb={3} flexGrow={1}>
                  <Typography variant="body2">
                    <strong>Starts:</strong> {format(new Date(test.startDate), 'MMM d, h:mm a')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Ends:</strong> {format(new Date(test.endDate), 'MMM d, h:mm a')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
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
        {!loading && tests.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6">No Tests Available</Typography>
              <Typography sx={{ color: "text.secondary" }}>There are currently no tests scheduled for your class.</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
