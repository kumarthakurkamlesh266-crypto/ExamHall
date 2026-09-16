import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, 
  MenuItem, Checkbox, ListItemText, Select, FormControl, InputLabel
} from '@mui/material';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { InlineMath } from 'react-katex';

export default function CreateTest() {
  const { user, userData } = useAuthStore();
  const [testName, setTestName] = useState('');
  const [testSubject, setTestSubject] = useState(userData?.subject || '');
  const [testClass, setTestClass] = useState('');
  const [testSection, setTestSection] = useState('');
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchQuestions = async () => {
      const q = query(collection(db, 'questions'), where('teacherId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailableQuestions(data);
    };
    fetchQuestions();
  }, [user]);

  const handleCreate = async () => {
    if (!testName || !startDate || !endDate || selectedQuestions.length === 0) {
      alert("Please fill all required fields and select at least one question.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'tests'), {
        teacherId: user?.uid,
        name: testName,
        subject: testSubject,
        targetClass: Number(testClass),
        section: testSection,
        duration,
        totalMarks,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        questions: selectedQuestions,
        createdAt: serverTimestamp()
      });
      alert('Test created successfully!');
      // Reset form
      setTestName('');
      setSelectedQuestions([]);
    } catch (err) {
      console.error(err);
      alert('Failed to create test');
    }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={4}>Create New Test</Typography>
      
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" mb={2}>Test Details</Typography>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField fullWidth label="Test Name" value={testName} onChange={e => setTestName(e.target.value)} required />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Subject" value={testSubject} onChange={e => setTestSubject(e.target.value)} required />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Class" type="number" value={testClass} onChange={e => setTestClass(e.target.value)} required />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Section" value={testSection} onChange={e => setTestSection(e.target.value)} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Total Marks" type="number" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} required />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Duration (minutes)" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Start Date/Time" type="datetime-local" InputLabelProps={{ shrink: true }} value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="End Date/Time" type="datetime-local" InputLabelProps={{ shrink: true }} value={endDate} onChange={e => setEndDate(e.target.value)} required />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" mb={2}>Select Questions</Typography>
            
            <FormControl fullWidth sx={{ mb: 2, flexGrow: 1, overflowY: 'auto', maxHeight: '400px' }}>
              <Box>
                {availableQuestions.map((q) => (
                  <Box key={q.id} display="flex" alignItems="center" mb={1} p={1} border={1} borderColor="divider" borderRadius={1}>
                    <Checkbox
                      checked={selectedQuestions.indexOf(q.id) > -1}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedQuestions([...selectedQuestions, q.id]);
                        else setSelectedQuestions(selectedQuestions.filter(id => id !== q.id));
                      }}
                    />
                    <Box sx={{ ml: 1, overflow: 'hidden' }}>
                       <InlineMath math={q.text.substring(0, 50)} renderError={() => <span>{q.text.substring(0, 50)}...</span>} />
                    </Box>
                  </Box>
                ))}
                {availableQuestions.length === 0 && <Typography variant="body2" color="text.secondary">No questions found. Add some in Question Bank.</Typography>}
              </Box>
            </FormControl>

            <Button 
              variant="contained" 
              size="large" 
              fullWidth 
              onClick={handleCreate}
              disabled={loading}
            >
              Create Test
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
