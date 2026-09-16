import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { People, Assignment, TrendingUp } from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';

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

export default function DashboardAnalytics() {
  const { user } = useAuthStore();
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeTests, setActiveTests] = useState(0);
  const [avgPerformance, setAvgPerformance] = useState('0.0');

  useEffect(() => {
    if (!user?.uid) return;

    // Total Students
    const unsubscribeStudents = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), (snap) => {
      setTotalStudents(snap.size);
    });

    // Active Tests
    const qTests = query(collection(db, 'tests'), where('teacherId', '==', user.uid));
    const unsubscribeTests = onSnapshot(qTests, (snap) => {
      let activeCount = 0;
      const now = new Date();
      snap.forEach(doc => {
        const data = doc.data();
        if (data.endDate && new Date(data.endDate) > now) {
          activeCount++;
        }
      });
      setActiveTests(activeCount);
    });

    // Average Class Performance (from Results)
    const qResults = query(collection(db, 'results'), where('teacherId', '==', user.uid));
    const unsubscribeResults = onSnapshot(qResults, (snap) => {
      let totalPercentage = 0;
      let count = 0;
      snap.forEach(doc => {
        const data = doc.data();
        if (typeof data.percentage === 'number') {
          totalPercentage += data.percentage;
          count++;
        }
      });
      if (count > 0) {
        setAvgPerformance((totalPercentage / count).toFixed(1));
      } else {
        setAvgPerformance('0.0');
      }
    });

    return () => {
      unsubscribeStudents();
      unsubscribeTests();
      unsubscribeResults();
    };
  }, [user?.uid]);

  return (
    <Grid container spacing={3} mb={6}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Total Students" value={totalStudents} icon={<People fontSize="large" />} color="#3b82f6" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Active Tests" value={activeTests} icon={<Assignment fontSize="large" />} color="#10b981" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Class Performance" value={`${avgPerformance}%`} icon={<TrendingUp fontSize="large" />} color="#f59e0b" />
      </Grid>
    </Grid>
  );
}
