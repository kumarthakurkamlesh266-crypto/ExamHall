import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Button, Alert, CircularProgress, TextField, Divider
} from '@mui/material';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import Logo from '../components/Logo';
import RoleSelection from '../components/RoleSelection';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, role, loading: globalLoading } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'auth' | 'onboarding'>('auth');
  const [googleUser, setGoogleUser] = useState<any>(null);

  // Email/Password states
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let userCred;
      if (isLogin) {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      }
      
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
      if (err.code === 'auth/email-already-in-use') {
         setError('Email already exists. Please login instead.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
         setError('Invalid email or password.');
      } else {
         setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

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
            
            <Box sx={{ mb: 4 }}>
              <Logo size="large" />
            </Box>
            
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 4, fontSize: '1.1rem', lineHeight: 1.5 }}>
              Smart Examination Platform for Schools, Colleges & Coaching Institutes
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 3, width: '100%', textAlign: 'left' }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleEmailAuth} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField 
                label="Email" 
                type="email" 
                fullWidth 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField 
                label="Password" 
                type="password" 
                fullWidth 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                sx={{ 
                  height: '56px', 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  borderRadius: '12px'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Login' : 'Sign Up')}
              </Button>
            </Box>

            <Button 
              variant="text" 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              sx={{ mb: 2 }}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </Button>

            <Divider sx={{ width: '100%', mb: 3 }}>OR</Divider>

            <Button
              variant="outlined"
              onClick={handleGoogleSignIn}
              disabled={loading}
              fullWidth
              sx={{ 
                height: '48px', 
                fontSize: '1rem', 
                fontWeight: 600,
                borderRadius: '12px',
                color: 'text.primary',
                borderColor: 'divider'
              }}
            >
              Continue with Google (Web Only)
            </Button>
          </Box>
        ) : (
          <RoleSelection googleUser={googleUser} />
        )}
      </Paper>
    </Box>
  );
}
