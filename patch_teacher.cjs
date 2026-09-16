const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardAnalytics.tsx', 'utf8');

const targetImports = `import { Box, Typography, Paper, Grid } from '@mui/material';`;
const replaceImports = `import { Box, Typography, Paper, Grid, Skeleton } from '@mui/material';`;
content = content.replace(targetImports, replaceImports);

const targetState = `  const [totalStudents, setTotalStudents] = useState(0);`;
const replaceState = `  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);`;
content = content.replace(targetState, replaceState);

const targetUnsubscribe = `    return () => {
      unsubscribeStudents();
      unsubscribeTests();
      unsubscribeResults();
    };
  }, [user?.uid]);`;
const replaceUnsubscribe = `    // Mark as loaded after a short delay or when data arrives.
    // For simplicity, we just mark it false once listeners are attached and have fired initially.
    // Realistically, onSnapshot fires immediately with cached data or empty state.
    setTimeout(() => setLoading(false), 800);

    return () => {
      unsubscribeStudents();
      unsubscribeTests();
      unsubscribeResults();
    };
  }, [user?.uid]);`;
content = content.replace(targetUnsubscribe, replaceUnsubscribe);

const targetStatCard = `const StatCard = ({ title, value, icon, color }: any) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 3, borderLeft: 6, borderColor: color }}>
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: \`\${color}15\`, color }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>{value}</Typography>
    </Box>
  </Paper>
);`;
const replaceStatCard = `const StatCard = ({ title, value, icon, color, loading }: any) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 3, borderLeft: 6, borderColor: color }}>
    {loading ? (
      <Skeleton variant="rounded" width={56} height={56} />
    ) : (
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: \`\${color}15\`, color }}>
        {icon}
      </Box>
    )}
    <Box flex={1}>
      {loading ? (
        <>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={40} />
        </>
      ) : (
        <>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>{value}</Typography>
        </>
      )}
    </Box>
  </Paper>
);`;
content = content.replace(targetStatCard, replaceStatCard);

const targetGridCards = `<Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Total Students" value={totalStudents} icon={<People fontSize="large" />} color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Active Tests" value={activeTests} icon={<Assignment fontSize="large" />} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Class Performance" value={\`\${avgPerformance}%\`} icon={<TrendingUp fontSize="large" />} color="#f59e0b" />
        </Grid>
      </Grid>`;
const replaceGridCards = `<Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard loading={loading} title="Total Students" value={totalStudents} icon={<People fontSize="large" />} color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard loading={loading} title="Active Tests" value={activeTests} icon={<Assignment fontSize="large" />} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard loading={loading} title="Class Performance" value={\`\${avgPerformance}%\`} icon={<TrendingUp fontSize="large" />} color="#f59e0b" />
        </Grid>
      </Grid>
      
      {loading && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
             <Paper sx={{ p: 3, borderRadius: 3 }}>
               <Skeleton variant="text" width="50%" height={32} sx={{ mb: 3 }} />
               <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1 }} />
             </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
             <Paper sx={{ p: 3, borderRadius: 3 }}>
               <Skeleton variant="text" width="50%" height={32} sx={{ mb: 3 }} />
               <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1 }} />
             </Paper>
          </Grid>
        </Grid>
      )}`;
content = content.replace(targetGridCards, replaceGridCards);

const targetChartIf = `{chartData.length > 0 && (`
const replaceChartIf = `{!loading && chartData.length > 0 && (`
content = content.replace(targetChartIf, replaceChartIf);

fs.writeFileSync('src/components/DashboardAnalytics.tsx', content);
