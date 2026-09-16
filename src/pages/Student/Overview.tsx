import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Stack, Skeleton } from '@mui/material';
import { Assignment, History, TrendingUp, EmojiEvents, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const StatCard = ({ title, value, icon, color, loading }: any) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 3, borderLeft: 6, borderColor: color }}>
    {loading ? (
      <Skeleton variant="rounded" width={56} height={56} />
    ) : (
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${color}15`, color }}>
        {icon}
      </Box>
    )}
    <Box flex={1}>
      {loading ? (
        <>
          <Skeleton variant="text" width="70%" height={24} />
          <Skeleton variant="text" width="50%" height={40} />
        </>
      ) : (
        <>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>{value}</Typography>
        </>
      )}
    </Box>
  </Paper>
);

export default function StudentOverview() {
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [upcomingTests, setUpcomingTests] = useState(0);

  useEffect(() => {
    if (!userData) return;
    const fetchUpcoming = async () => {
      try {
        const q = query(collection(db, 'tests'), where('targetClass', '==', Number(userData.studentClass || userData.standard)));
        const snap = await getDocs(q);
        let data = snap.docs.map(doc => doc.data());
        data = data.filter((test: any) => {
          if (test.section && test.section !== userData.section) return false;
          if (test.stream && test.stream !== userData.stream) return false;
          return new Date(test.endDate) > new Date(); // Active or upcoming
        });
        setUpcomingTests(data.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, [userData]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>Welcome back, {userData?.name}!</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>Class {userData?.studentClass} {userData?.section}</Typography>

      <Grid container spacing={3} mb={6}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard loading={loading} title="Upcoming Tests" value={upcomingTests} icon={<Assignment fontSize="large" />} color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard loading={loading} title="Tests Completed" value={userData?.testsAttempted || 0} icon={<History fontSize="large" />} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard loading={loading} title="Average Score" value={`${userData?.averageScore || 0}%`} icon={<TrendingUp fontSize="large" />} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard loading={loading} title="Current Rank" value="-" icon={<EmojiEvents fontSize="large" />} color="#8b5cf6" />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>Quick Actions</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button 
          variant="contained" 
          startIcon={<PlayArrow />} 
          onClick={() => navigate('/student/tests')}
          sx={{ py: 1.5, px: 3, borderRadius: 2 }}
        >
          View Available Tests
        </Button>
      </Stack>
    </Box>
  );
}
