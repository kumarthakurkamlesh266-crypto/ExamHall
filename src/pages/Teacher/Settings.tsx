import { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function TeacherSettings() {
  const { user, userData, setUserData } = useAuthStore();
  const navigate = useNavigate();

  const [apiKey, setApiKey] = useState(userData?.geminiApiKey || '');
  const [name, setName] = useState(userData?.name || '');
  const [mobile, setMobile] = useState(userData?.mobile || '');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [openLogout, setOpenLogout] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const updates = {
        name,
        mobile,
        geminiApiKey: apiKey
      };
      
      await updateDoc(doc(db, 'users', user.uid), updates);
      setUserData({ ...userData, ...updates });
      setSuccess('Settings updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth', { replace: true });
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto', width: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>Account Settings</Typography>
      
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField 
              fullWidth label="Full Name" 
              value={name} onChange={e => setName(e.target.value)} 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField 
              fullWidth label="Mobile Number" 
              value={mobile} onChange={e => setMobile(e.target.value)} 
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField 
              fullWidth 
              label="Email Address" 
              value={userData?.email || ''} 
              disabled 
              helperText="Email cannot be changed"
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>AI Configuration</Typography>
            <TextField 
              fullWidth 
              type="password"
              label="Gemini API Key" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              helperText="Your personal Google Gemini API key is required to use AI features."
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleSave}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'error.main' }}>
        <Typography variant="h6" sx={{ color: "error", mb: 2 }}>Account Actions</Typography>
        <Button 
          variant="contained" 
          color="error" 
          fullWidth
          size="large"
          onClick={() => setOpenLogout(true)}
        >
          Sign Out
        </Button>
      </Paper>

      {/* Logout Dialog */}
      <Dialog open={openLogout} onClose={() => setOpenLogout(false)}>
        <DialogTitle>Sign Out</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to sign out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogout(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained" autoFocus>
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
