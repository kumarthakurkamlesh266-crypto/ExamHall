import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';

export default function TeacherResults() {
  const { user } = useAuthStore();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchResults = async () => {
      const q = query(collection(db, 'results'), where('teacherId', '==', user.uid));
      const snap = await getDocs(q);
      
      const resPromises = snap.docs.map(async (d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          testName: data.testName || 'Unknown',
          studentName: data.studentName || 'Unknown',
          studentRoll: data.studentRoll || '-',
        };
      });
      
      const resolved = await Promise.all(resPromises);
      setResults(resolved.sort((a, b) => b.submittedAt?.toMillis() - a.submittedAt?.toMillis()));
    };
    fetchResults();
  }, [user]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={4}>Student Results Overview</Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Roll Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Test Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.studentName}</TableCell>
                <TableCell>{r.studentRoll}</TableCell>
                <TableCell>{r.testName}</TableCell>
                <TableCell>{r.score.toFixed(1)}</TableCell>
                <TableCell>
                  <Chip 
                    label={`${r.percentage.toFixed(1)}%`} 
                    color={r.percentage >= 80 ? 'success' : r.percentage >= 50 ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{r.submittedAt ? format(r.submittedAt.toDate(), 'MMM d, yyyy') : '-'}</TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No results found yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
