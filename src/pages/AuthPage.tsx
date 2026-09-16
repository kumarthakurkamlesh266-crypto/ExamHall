import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Button, Alert, CircularProgress, Paper
} from '@mui/material';
import { auth, db } from '../lib/firebase';
import { 
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import RoleSelection from '../components/RoleSelection';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setRole, setUserData } = useAuthStore();
  
  const [step, setStep] = useState<'auth' | 'onboarding'>('auth');
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const uid = userCred.user.uid;
      
      // Check if user already exists
      const teacherDoc = await getDoc(doc(db, 'teachers', uid));
      const studentDoc = await getDoc(doc(db, 'students', uid));
      
      if (teacherDoc.exists()) {
        setRole('teacher');
        setUserData({ id: teacherDoc.id, ...teacherDoc.data() });
        navigate('/teacher');
        return;
      } else if (studentDoc.exists()) {
        setRole('student');
        setUserData({ id: studentDoc.id, ...studentDoc.data() });
        navigate('/student');
        return;
      }

      // If user doesn't exist, proceed to onboarding step
      setGoogleUser(userCred.user);
      setStep('onboarding');
      
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
         // Ignore
      } else {
         setError(err.message || 'Google Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          
          {step === 'auth' ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" mb={2}>
                Welcome to ExamHall
              </Typography>
              <Typography color="text.secondary" mb={4}>
                Sign in to access your dashboard.
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              
              <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
                Note: Email/Password registration is restricted by platform permissions. Please use Google Sign-In to continue securely.
              </Alert>

              <Button
                variant="contained"
                size="large"
                onClick={handleGoogleSignIn}
                disabled={loading}
                fullWidth
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue with Google'}
              </Button>
            </Box>
          ) : (
            <RoleSelection googleUser={googleUser} />
          )}

        </Paper>
      </Container>
    </Box>
  );
}
