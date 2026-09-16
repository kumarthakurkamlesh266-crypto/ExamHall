import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { People, Assignment, TrendingUp } from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';

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
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    // Total Students
    const unsubscribeStudents = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), (snap) => {
      setTotalStudents(snap.size);
    });

    let currentTests: any[] = [];
    let currentResults: any[] = [];

    const processData = (t: any[], r: any[]) => {
      let activeCount = 0;
      const now = new Date();
      const testsMap = new Map();
      
      t.forEach(test => {
        if (test.endDate && new Date(test.endDate) > now) {
          activeCount++;
        }
        testsMap.set(test.id, {
          name: test.name || 'Unnamed Test',
          totalPercentage: 0,
          count: 0
        });
      });
      setActiveTests(activeCount);

      let globalTotalPercentage = 0;
      let globalCount = 0;

      r.forEach(res => {
        if (typeof res.percentage === 'number') {
          globalTotalPercentage += res.percentage;
          globalCount++;
          
          if (testsMap.has(res.testId)) {
            const tData = testsMap.get(res.testId);
            tData.totalPercentage += res.percentage;
            tData.count++;
          }
        }
      });

      if (globalCount > 0) {
        setAvgPerformance((globalTotalPercentage / globalCount).toFixed(1));
      } else {
        setAvgPerformance('0.0');
      }
      
      const newChartData = Array.from(testsMap.values())
        .filter(t => t.count > 0)
        .map(t => ({
          name: t.name.length > 15 ? t.name.substring(0, 15) + '...' : t.name,
          avgScore: Number((t.totalPercentage / t.count).toFixed(1)),
          completions: t.count
        }))
        .slice(-6); // Keep last 6 tests for the chart
        
      setChartData(newChartData);
    };

    const qTests = query(collection(db, 'tests'), where('teacherId', '==', user.uid));
    const unsubscribeTests = onSnapshot(qTests, (snap) => {
      currentTests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      processData(currentTests, currentResults);
    });

    const qResults = query(collection(db, 'results'), where('teacherId', '==', user.uid));
    const unsubscribeResults = onSnapshot(qResults, (snap) => {
      currentResults = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      processData(currentTests, currentResults);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeTests();
      unsubscribeResults();
    };
  }, [user?.uid]);

  return (
    <Box sx={{ mb: 6 }}>
      <Grid container spacing={3} mb={4}>
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
      
      {chartData.length > 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Test Performance Trend</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="avgScore" name="Avg Score (%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Test Submissions</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: '#f1f5f9' }}
                    />
                    <Legend />
                    <Bar dataKey="completions" name="Submissions" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
