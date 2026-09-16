import { useNavigate } from 'react-router-dom';
import { Button, Typography, Container, Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', textAlign: 'center', width: '100%' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 2, position: 'relative' }}>
            <SchoolIcon sx={{ fontSize: 72, color: 'primary.main' }} />
            <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main', position: 'absolute', bottom: -5, right: -10, bgcolor: 'background.paper', borderRadius: '50%' }} />
          </Box>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            ExamHall
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal' }}>
            Smart Examination Platform for Modern Schools
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/auth')}
              fullWidth
            >
              Login / Register
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
