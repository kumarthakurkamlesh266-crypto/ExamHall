import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentHistory() {
  const { user } = useAuthStore();
  const [results, setResults] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const q = query(collection(db, 'results'), where('studentId', '==', user.uid));
      const snap = await getDocs(q);
      
      const resPromises = snap.docs.map(async (d) => {
        const data = d.data();
        const testDoc = await getDoc(doc(db, 'tests', data.testId));
        return {
          id: d.id,
          ...data,
          testName: testDoc.exists() ? testDoc.data().name : 'Unknown Test',
          subject: testDoc.exists() ? testDoc.data().subject : 'Unknown',
        };
      });
      
      const resolved = await Promise.all(resPromises);
      setResults(resolved.sort((a, b) => b.submittedAt?.toMillis() - a.submittedAt?.toMillis()));

      // Prepare chart data
      const cData = resolved.map(r => ({
        name: r.testName.substring(0, 10),
        percentage: Math.round(r.percentage)
      }));
      setChartData(cData.reverse()); // Chronological
    };
    fetchHistory();
  }, [user]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>Test History</Typography>
      
      {chartData.length > 0 && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Performance Overview</Typography>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Test Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.testName}</TableCell>
                <TableCell>{r.subject}</TableCell>
                <TableCell>{r.score.toFixed(1)}</TableCell>
                <TableCell>
                  <Typography color={r.percentage >= 80 ? 'success.main' : r.percentage >= 50 ? 'warning.main' : 'error.main'} fontWeight="bold">
                    {r.percentage.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell>{r.submittedAt ? format(r.submittedAt.toDate(), 'MMM d, yyyy h:mm a') : '-'}</TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center" }}>No test history available.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
