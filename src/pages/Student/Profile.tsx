import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Alert } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';

export default function StudentProfile() {
  const { user, userData, setUserData } = useAuthStore();
  const [name, setName] = useState(userData?.name || '');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const updates = { name };
      await updateDoc(doc(db, 'students', user.uid), updates);
      setUserData({ ...userData, ...updates });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto', width: '100%' }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>My Profile</Typography>
      
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid xs={12} sm={6}>
            <TextField 
              fullWidth label="Full Name" 
              value={name} onChange={e => setName(e.target.value)} 
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField 
              fullWidth label="Roll Number" 
              value={userData?.rollNumber || ''} 
              disabled 
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField 
              fullWidth label="Class" 
              value={userData?.studentClass || ''} 
              disabled 
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField 
              fullWidth label="Section" 
              value={userData?.section || ''} 
              disabled 
            />
          </Grid>
          
          <Grid xs={12}>
            <TextField 
              fullWidth 
              label="Email Address" 
              value={userData?.email || ''} 
              disabled 
              helperText="Email cannot be changed"
            />
          </Grid>
          
          <Grid xs={12}>
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
    </Box>
  );
}
