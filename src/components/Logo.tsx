import { Box, Typography } from '@mui/material';
import { GraduationCap } from 'lucide-react';

export default function Logo({ showText = true, size = 'default' }: { showText?: boolean, size?: 'small' | 'default' | 'large' }) {
  const iconSizes = {
    small: 24,
    default: 32,
    large: 48
  };
  
  const textSizes = {
    small: '1.25rem',
    default: '1.5rem',
    large: '2.5rem'
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#4F46E5', 
        color: 'white', 
        p: size === 'small' ? 0.75 : size === 'large' ? 1.5 : 1, 
        borderRadius: size === 'large' ? '16px' : '10px',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
      }}>
        <GraduationCap size={iconSizes[size]} strokeWidth={2.5} />
      </Box>
      
      {showText && (
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '-0.5px',
            fontSize: textSizes[size],
            color: '#1e293b'
          }}
        >
          Exam<Box component="span" sx={{ color: '#4F46E5' }}>Hall</Box>
        </Typography>
      )}
    </Box>
  );
}
