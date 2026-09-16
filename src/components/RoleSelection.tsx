import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, ToggleButton, ToggleButtonGroup, 
  TextField, Button, Alert, CircularProgress, MenuItem
} from '@mui/material';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { User } from 'firebase/auth';

interface RoleSelectionProps {
  googleUser: User;
}

export default function RoleSelection({ googleUser }: RoleSelectionProps) {
  const navigate = useNavigate();
  const { setRole, setUserData } = useAuthStore();
  
  const [role, setLocalRole] = useState<'teacher' | 'student'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states for onboarding
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const [rollNumber, setRollNumber] = useState('');
  const [studentClass, setStudentClass] = useState<number | ''>('');
  const [section, setSection] = useState('');
  const [stream, setStream] = useState('');

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser) return;
    
    setLoading(true);
    setError('');

    try {
      const uid = googleUser.uid;
      const email = googleUser.email;
      const name = googleUser.displayName || (role === 'teacher' ? 'New Teacher' : 'New Student');

      if (role === 'teacher') {
        const teacherData = {
          uid, name, email, mobile, subject, geminiApiKey,
          assignedClasses: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'teachers', uid), teacherData);
        setRole('teacher');
        setUserData({ id: uid, ...teacherData });
        navigate('/teacher');
      } else {
        const studentData = {
          uid, name, email, rollNumber, 
          studentClass: Number(studentClass), 
          section,
          stream: Number(studentClass) >= 11 ? stream : null,
          testsAttempted: 0,
          averageScore: 0,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'students', uid), studentData);
        setRole('student');
        setUserData({ id: uid, ...studentData });
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" align="center" mb={2}>
        Complete Profile
      </Typography>
      <Typography color="text.secondary" align="center" mb={4}>
        Please provide a few more details to set up your account.
      </Typography>

      <ToggleButtonGroup
        color="primary"
        value={role}
        exclusive
        onChange={(_, newRole) => { if (newRole) setLocalRole(newRole); }}
        fullWidth
        sx={{ mb: 4 }}
      >
        <ToggleButton value="student">Student</ToggleButton>
        <ToggleButton value="teacher">Teacher</ToggleButton>
      </ToggleButtonGroup>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleCompleteOnboarding} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        <TextField 
          label="Email (from Google)" 
          value={googleUser?.email || ''}
          disabled
        />
        <TextField 
          label="Name (from Google)" 
          value={googleUser?.displayName || ''}
          disabled
        />

        {role === 'teacher' && (
          <>
            <TextField 
              label="Mobile Number" 
              required 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <TextField 
              label="Subject Specialization" 
              required 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <TextField 
              label="Gemini API Key (Optional for AI features)" 
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              helperText="Required for generating AI tests"
            />
          </>
        )}

        {role === 'student' && (
          <>
            <TextField 
              label="Roll Number" 
              required 
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
            <TextField 
              label="Class (1-12)" 
              type="number"
              required 
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value ? Number(e.target.value) : '')}
            />
            <TextField 
              label="Section (e.g. A, B)" 
              required 
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
            {(studentClass === 11 || studentClass === 12) && (
              <TextField
                select
                label="Stream"
                required
                value={stream}
                onChange={(e) => setStream(e.target.value)}
              >
                <MenuItem value="PCM">PCM (Physics, Chem, Math)</MenuItem>
                <MenuItem value="PCB">PCB (Physics, Chem, Bio)</MenuItem>
                <MenuItem value="Commerce">Commerce</MenuItem>
                <MenuItem value="Arts">Arts</MenuItem>
              </TextField>
            )}
          </>
        )}

        <Button 
          type="submit" 
          variant="contained" 
          size="large" 
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Setup'}
        </Button>
      </Box>
    </Box>
  );
}
