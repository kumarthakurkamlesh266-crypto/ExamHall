import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, ToggleButtonGroup, ToggleButton, 
  TextField, Button, Alert, CircularProgress,
  Fade, InputAdornment
} from '@mui/material';
import { 
  School as SchoolIcon, 
  Person as PersonIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface RoleSelectionProps {
  googleUser: any;
}

export default function RoleSelection({ googleUser }: RoleSelectionProps) {
  const navigate = useNavigate();
  const [role, setLocalRole] = useState<'teacher' | 'student'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Teacher fields
  const [mobile, setMobile] = useState('');
  const [organization, setOrganization] = useState('');

  // Student fields
  const [rollNumber, setRollNumber] = useState('');
  const [standard, setStandard] = useState('');

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const uid = googleUser.uid;
      const email = googleUser.email;
      const name = googleUser.displayName || (role === 'teacher' ? 'New Teacher' : 'New Student');
      const photoUrl = googleUser.photoURL || '';

      if (role === 'teacher') {
        const teacherData = {
          uid, 
          role: 'teacher', 
          name, 
          email, 
          photoUrl,
          mobile, 
          organization,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        await setDoc(doc(db, 'users', uid), teacherData);
        navigate('/teacher', { replace: true });
      } else {
        const studentData = {
          uid, 
          role: 'student', 
          name, 
          email, 
          photoUrl,
          rollNumber, 
          standard,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        await setDoc(doc(db, 'users', uid), studentData);
        navigate('/student', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          Welcome to ExamHall
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please complete your profile to continue
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
          I am a...
        </Typography>
        <ToggleButtonGroup
          color="primary"
          value={role}
          exclusive
          onChange={(_, newRole) => {
            if (newRole) setLocalRole(newRole);
          }}
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              py: 2,
              borderRadius: '12px !important',
              border: '2px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
                color: 'primary.main'
              }
            }
          }}
        >
          <ToggleButton value="student" sx={{ gap: 1 }}>
            <PersonIcon /> Student
          </ToggleButton>
          <ToggleButton value="teacher" sx={{ gap: 1 }}>
            <SchoolIcon /> Teacher
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box component="form" onSubmit={handleCompleteOnboarding} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        <TextField 
          label="Email (from Google)" 
          value={googleUser?.email || ''}
          disabled
        />
        <TextField 
          label="Full Name (from Google)" 
          value={googleUser?.displayName || ''}
          disabled
        />

        {role === 'teacher' && (
          <Fade in={true}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Mobile Number" 
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField 
                label="Organization / Institute Name" 
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Fade>
        )}

        {role === 'student' && (
          <Fade in={true}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Roll Number / Student ID" 
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField 
                label="Class / Standard" 
                required
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
              />
            </Box>
          </Fade>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
          sx={{ 
            height: '56px', 
            fontSize: '1.1rem', 
            fontWeight: 600,
            borderRadius: '12px',
            mt: 2
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Profile'}
        </Button>

      </Box>
    </Box>
  );
}
