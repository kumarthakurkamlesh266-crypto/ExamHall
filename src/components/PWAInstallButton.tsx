import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Button, Typography, Modal, Paper } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AppleIcon from '@mui/icons-material/Apple';
import CloseIcon from '@mui/icons-material/Close';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={<DownloadIcon />}
        onClick={install}
        size="small"
        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, display: { xs: 'none', md: 'flex' } }}
      >
        Install App
      </Button>
    );
  }

  if (isIOS) {
    return (
      <>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<AppleIcon />}
          onClick={() => setShowIOSGuide(true)}
          size="small"
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: 'divider', display: { xs: 'none', md: 'flex' } }}
        >
          Install App
        </Button>

        <Modal
          open={showIOSGuide}
          onClose={() => setShowIOSGuide(false)}
          aria-labelledby="ios-install-title"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Paper sx={{ width: '90%', maxWidth: 400, p: 4, borderRadius: 3, position: 'relative' }}>
            <Button 
              onClick={() => setShowIOSGuide(false)}
              sx={{ position: 'absolute', top: 8, right: 8, minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </Button>
            <Typography id="ios-install-title" variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Install on iPhone / iPad
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
              1. Tap the <strong>Share</strong> button in the Safari toolbar.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setShowIOSGuide(false)}
            >
              Close
            </Button>
          </Paper>
        </Modal>
      </>
    );
  }

  return null;
};
