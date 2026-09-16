import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  AppBar, Toolbar, Typography, IconButton, Avatar, Divider, useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard, Assignment, LibraryBooks, AutoFixHigh,
  People, EmojiEvents, Event, Notifications, Settings, Menu as MenuIcon, Logout
} from '@mui/icons-material';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

import TeacherOverview from './Teacher/Overview';
import QuestionBank from './Teacher/QuestionBank';
import AIAssistant from './Teacher/AIAssistant';
import CreateTest from './Teacher/CreateTest';
import TeacherSettings from './Teacher/Settings';
import TeacherResults from './Teacher/Results';
import StudentsManagement from './Teacher/Students';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '' },
  { text: 'Create Test', icon: <Assignment />, path: 'create-test' },
  { text: 'Question Bank', icon: <LibraryBooks />, path: 'questions' },
  { text: 'AI Assistant', icon: <AutoFixHigh />, path: 'ai-assistant' },
  { text: 'Students', icon: <People />, path: 'students' },
  { text: 'Results', icon: <EmojiEvents />, path: 'results' },
  { text: 'Calendar', icon: <Event />, path: 'calendar' },
  { text: 'Notices', icon: <Notifications />, path: 'notices' },
  { text: 'Settings', icon: <Settings />, path: 'settings' },
];

export default function TeacherDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>T</Avatar>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>Teacher Portal</Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              sx={{ borderRadius: 2 }}
              onClick={() => {
                navigate(`/teacher/${item.path}`);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ px: 2, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 2, color: 'error.main' }} onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            ExamHall
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Routes>
          <Route path="" element={<TeacherOverview />} />
          <Route path="create-test" element={<CreateTest />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="students" element={<StudentsManagement />} />
          <Route path="results" element={<TeacherResults />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Routes>
      </Box>
    </Box>
  );
}
