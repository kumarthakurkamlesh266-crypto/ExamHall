import React from 'react';
import { Grid, TextField } from '@mui/material';

interface TestSchedulerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export default function TestScheduler({ startDate, endDate, onStartDateChange, onEndDateChange }: TestSchedulerProps) {
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField 
          fullWidth 
          label="Start Date/Time" 
          type="datetime-local" 
          slotProps={{ inputLabel: { shrink: true } }} 
          value={startDate} 
          onChange={e => onStartDateChange(e.target.value)} 
          required 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField 
          fullWidth 
          label="End Date/Time" 
          type="datetime-local" 
          slotProps={{ inputLabel: { shrink: true } }} 
          value={endDate} 
          onChange={e => onEndDateChange(e.target.value)} 
          required 
        />
      </Grid>
    </>
  );
}
