import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, 
  MenuItem, Checkbox, FormControl, Select, InputLabel, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, FormHelperText
} from '@mui/material';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function CreateTest() {
  const { user, userData } = useAuthStore();
  const [testName, setTestName] = useState('');
  const [testSubject, setTestSubject] = useState(userData?.subject || '');
  const [testClass, setTestClass] = useState('');
  const [testSection, setTestSection] = useState('');
  const [testStream, setTestStream] = useState('');
  const [chapters, setChapters] = useState('');
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom Question Modal
  const [openModal, setOpenModal] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState('MCQ');

  const fetchQuestions = async () => {
    if (!user) return;
    const q = query(collection(db, 'questions'), where('teacherId', '==', user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAvailableQuestions(data);
  };

  useEffect(() => {
    fetchQuestions();
  }, [user]);

  const handleCreate = async () => {
    if (!testName || !startDate || !endDate || !testClass || selectedQuestions.length === 0) {
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
        section: testSection || null,
        stream: testStream || null,
        chapters,
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
      setTestSection('');
      setTestStream('');
      setChapters('');
    } catch (err) {
      console.error(err);
      alert('Failed to create test');
    }
    setLoading(false);
  };

  const handleQuickAddQuestion = async () => {
    if (!newQText || !newQType) return;
    try {
      const docRef = await addDoc(collection(db, 'questions'), {
        teacherId: user?.uid,
        text: newQText,
        type: newQType,
        options: newQType === 'MCQ' || newQType === 'Multiple Correct' ? ['Option 1', 'Option 2'] : [],
        correctAnswer: '',
        marks: 5,
        createdAt: serverTimestamp()
      });
      await fetchQuestions();
      setSelectedQuestions(prev => [...prev, docRef.id]);
      setOpenModal(false);
      setNewQText('');
      setNewQType('MCQ');
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>Create New Test</Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Test Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Test Name" value={testName} onChange={e => setTestName(e.target.value)} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Subject" value={testSubject} onChange={e => setTestSubject(e.target.value)} required />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Class (1-12)" type="number" value={testClass} onChange={e => setTestClass(e.target.value)} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Section (Optional)" value={testSection} onChange={e => setTestSection(e.target.value)} helperText="Leave empty for all sections" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Stream (Optional)</InputLabel>
                  <Select value={testStream} label="Stream (Optional)" onChange={e => setTestStream(e.target.value)}>
                    <MenuItem value=""><em>Any</em></MenuItem>
                    <MenuItem value="Science (PCM)">Science (PCM)</MenuItem>
                    <MenuItem value="Science (PCB)">Science (PCB)</MenuItem>
                    <MenuItem value="Commerce">Commerce</MenuItem>
                    <MenuItem value="Arts">Arts</MenuItem>
                  </Select>
                  <FormHelperText>For Class 11-12</FormHelperText>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Chapters / Syllabus" value={chapters} onChange={e => setChapters(e.target.value)} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Total Marks" type="number" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Duration (minutes)" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Start Date/Time" type="datetime-local" slotProps={{ inputLabel: { shrink: true } }} value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="End Date/Time" type="datetime-local" slotProps={{ inputLabel: { shrink: true } }} value={endDate} onChange={e => setEndDate(e.target.value)} required />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Select Questions</Typography>
              <Button size="small" variant="outlined" onClick={() => setOpenModal(true)}>+ Quick Add</Button>
            </Box>
            
            <FormControl fullWidth sx={{ mb: 2, flexGrow: 1, overflowY: 'auto', maxHeight: '500px' }}>
              <Box>
                {availableQuestions.map((q) => (
                  <Box key={q.id} display="flex" alignItems="flex-start" mb={1} p={1} border={1} borderColor="divider" borderRadius={1}>
                    <Checkbox
                      checked={selectedQuestions.indexOf(q.id) > -1}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedQuestions([...selectedQuestions, q.id]);
                        else setSelectedQuestions(selectedQuestions.filter(id => id !== q.id));
                      }}
                      sx={{ pt: 0 }}
                    />
                    <Box sx={{ ml: 1, overflow: 'hidden', width: '100%' }}>
                       <Typography variant="caption" display="block" sx={{ color: "text.secondary", mb: 0.5 }}>{q.type}</Typography>
                       <Box sx={{ fontSize: '0.875rem' }}>
                         <InlineMath math={q.text.length > 60 ? q.text.substring(0, 60) + '...' : q.text} renderError={() => <span>{q.text}</span>} />
                       </Box>
                    </Box>
                  </Box>
                ))}
                {availableQuestions.length === 0 && <Typography variant="body2" sx={{ color: "text.secondary" }}>No questions found. Add some in Question Bank.</Typography>}
              </Box>
            </FormControl>
            <Button 
              variant="contained" 
              size="large" 
              fullWidth 
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Test'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Add Question</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
            <InputLabel>Question Type</InputLabel>
            <Select value={newQType} label="Question Type" onChange={e => setNewQType(e.target.value)}>
              <MenuItem value="MCQ">MCQ</MenuItem>
              <MenuItem value="Multiple Correct">Multiple Correct</MenuItem>
              <MenuItem value="True/False">True/False</MenuItem>
              <MenuItem value="Short Answer">Short Answer</MenuItem>
              <MenuItem value="Long Answer">Long Answer</MenuItem>
              <MenuItem value="Numerical">Numerical</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Question Text (LaTeX supported)"
            value={newQText}
            onChange={e => setNewQText(e.target.value)}
            helperText="Example: \int_{0}^{1} x^2 dx"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleQuickAddQuestion}>Add & Select</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
