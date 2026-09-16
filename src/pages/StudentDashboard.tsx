import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, AppBar, Toolbar, Typography, IconButton, Avatar, 
  BottomNavigation, BottomNavigationAction, Paper, Button
} from '@mui/material';
import {
  Dashboard, Assignment, History, Event, Notifications, Person, Logout
} from '@mui/icons-material';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../store/useAuthStore';

import StudentOverview from './Student/Overview';
import StudentTests from './Student/Tests';
import TakeTest from './Student/TakeTest';
import StudentHistory from './Student/History';
import StudentProfile from './Student/Profile';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useAuthStore();
  
  const currentPath = location.pathname.split('/').pop() || '';
  
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 7, sm: 0 } }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', color: 'text.primary' }}>
        <Toolbar>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>S</Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            ExamHall
          </Typography>
          <Button color="error" startIcon={<Logout />} onClick={handleLogout} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3, maxWidth: '1200px', mx: 'auto', width: '100%' }}>
        <Routes>
          <Route path="" element={<StudentOverview />} />
          <Route path="tests" element={<StudentTests />} />
          <Route path="take-test/:testId" element={<TakeTest />} />
          <Route path="history" element={<StudentHistory />} />
          <Route path="profile" element={<StudentProfile />} />
        </Routes>
      </Box>

      {/* Bottom Navigation for Mobile */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { sm: 'none' } }} elevation={3}>
        <BottomNavigation
          showLabels
          value={currentPath}
          onChange={(event, newValue) => {
            navigate(`/student/${newValue === 'dashboard' ? '' : newValue}`);
          }}
        >
          <BottomNavigationAction label="Home" value="dashboard" icon={<Dashboard />} />
          <BottomNavigationAction label="Tests" value="tests" icon={<Assignment />} />
          <BottomNavigationAction label="History" value="history" icon={<History />} />
          <BottomNavigationAction label="Profile" value="profile" icon={<Person />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
