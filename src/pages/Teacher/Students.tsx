import { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';

export default function StudentsManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterStream, setFilterStream] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = filterClass ? String(student.studentClass) === filterClass : true;
      const matchesSection = filterSection ? (student.section || '').toLowerCase() === filterSection.toLowerCase() : true;
      const matchesStream = filterStream ? student.stream === filterStream : true;

      return matchesSearch && matchesClass && matchesSection && matchesStream;
    });
  }, [students, searchQuery, filterClass, filterSection, filterStream]);

  // Unique values for dropdowns
  const uniqueClasses = Array.from(new Set(students.map(s => String(s.studentClass)))).filter(Boolean).sort();
  const uniqueSections = Array.from(new Set(students.map(s => s.section))).filter(Boolean).sort();
  const uniqueStreams = Array.from(new Set(students.map(s => s.stream))).filter(Boolean).sort();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>Students Management</Typography>
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Search by Name/Roll No"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{ input: { 
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
               } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Filter Class</InputLabel>
              <Select
                value={filterClass}
                label="Filter Class"
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <MenuItem value=""><em>All Classes</em></MenuItem>
                {uniqueClasses.map(c => (
                  <MenuItem key={c} value={c}>Class {c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Filter Section</InputLabel>
              <Select
                value={filterSection}
                label="Filter Section"
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <MenuItem value=""><em>All Sections</em></MenuItem>
                {uniqueSections.map(s => (
                  <MenuItem key={s as string} value={s as string}>Section {s as string}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Filter Stream</InputLabel>
              <Select
                value={filterStream}
                label="Filter Stream"
                onChange={(e) => setFilterStream(e.target.value)}
              >
                <MenuItem value=""><em>All Streams</em></MenuItem>
                {uniqueStreams.map(s => (
                  <MenuItem key={s as string} value={s as string}>{s as string}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Roll Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Class & Section</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Stream</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tests Taken</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Avg Score</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Registration Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 3 }}>
                  No students match the criteria.
                </TableCell>
              </TableRow>
            )}
            {filteredStudents.map((student) => (
              <TableRow key={student.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>
                  Class {student.studentClass} 
                  {student.section && ` - Sec ${student.section}`}
                </TableCell>
                <TableCell>
                  {student.stream ? (
                    <Chip label={student.stream} size="small" color="primary" variant="outlined" />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{student.testsAttempted || 0}</TableCell>
                <TableCell>{student.averageScore ? `${student.averageScore.toFixed(1)}%` : '-'}</TableCell>
                <TableCell>
                  {student.createdAt ? format(new Date(student.createdAt), 'MMM dd, yyyy') : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
