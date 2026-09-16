import { Box, Typography, Grid, Paper, Button, Stack } from '@mui/material';
import { People, Assignment, LibraryBooks, CheckCircle, Add, AutoFixHigh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }: any) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 3, borderLeft: 6, borderColor: color }}>
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${color}15`, color }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
      <Typography variant="h4" fontWeight="bold">{value}</Typography>
    </Box>
  </Paper>
);

export default function TeacherOverview() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={4}>Dashboard Overview</Typography>

      <Grid container spacing={3} mb={6}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard title="Total Students" value="0" icon={<People fontSize="large" />} color="#3b82f6" />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard title="Total Tests" value="0" icon={<Assignment fontSize="large" />} color="#8b5cf6" />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard title="Total Questions" value="0" icon={<LibraryBooks fontSize="large" />} color="#f59e0b" />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard title="Completed Tests" value="0" icon={<CheckCircle fontSize="large" />} color="#10b981" />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight="bold" mb={3}>Quick Actions</Typography>
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
