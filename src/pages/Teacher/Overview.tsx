import { Box, Typography, Button, Stack } from '@mui/material';
import { Add, AutoFixHigh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardAnalytics from '../../components/DashboardAnalytics';

export default function TeacherOverview() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>Dashboard Overview</Typography>
      
      <DashboardAnalytics />

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
