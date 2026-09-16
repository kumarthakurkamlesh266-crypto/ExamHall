import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Button, Alert, CircularProgress
} from '@mui/material';
import { School } from '@mui/icons-material';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import RoleSelection from '../components/RoleSelection';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, role, loading: globalLoading } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'auth' | 'onboarding'>('auth');
  const [googleUser, setGoogleUser] = useState<any>(null);

  // Auto-redirect if already logged in and role is set
  useEffect(() => {
    if (user && role === 'teacher') {
      navigate('/teacher', { replace: true });
    } else if (user && role === 'student') {
      navigate('/student', { replace: true });
    } else if (user && !role && !globalLoading) {
      // User is logged in but has no role document yet
      setGoogleUser(user);
      setStep('onboarding');
    }
  }, [user, role, navigate, globalLoading]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role === 'teacher') {
          navigate('/teacher', { replace: true });
        } else {
          navigate('/student', { replace: true });
        }
      } else {
        // New user
        setGoogleUser(userCred.user);
        setStep('onboarding');
      }
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

  if (globalLoading) return null;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      bgcolor: '#F5F7FA', 
      p: 2 
    }}>
      <Paper sx={{ 
        p: { xs: 4, md: 5 }, 
        borderRadius: '24px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        maxWidth: '500px',
        width: '100%',
        mx: 'auto'
      }}>
        {step === 'auth' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 2, 
              borderRadius: '16px',
              mb: 3 // 24px spacing
            }}>
              <School sx={{ fontSize: 40 }} />
            </Box>
            
            <Typography variant="h3" sx={{ fontWeight: "bold", color: "primary.main", mb: 2, letterSpacing: '-0.5px' }}>
              ExamHall
            </Typography>
            
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 4, fontSize: '1.1rem', lineHeight: 1.5 }}>
              Smart Examination Platform for Schools, Colleges & Coaching Institutes
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 3, width: '100%', textAlign: 'left' }}>{error}</Alert>}
            
            <Button
              variant="contained"
              onClick={handleGoogleSignIn}
              disabled={loading}
              fullWidth
              sx={{ 
                height: '56px', 
                fontSize: '1.1rem', 
                fontWeight: 600,
                borderRadius: '12px'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login / Register'}
            </Button>
          </Box>
        ) : (
          <RoleSelection googleUser={googleUser} />
        )}
      </Paper>
    </Box>
  );
}
