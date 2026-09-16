import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, 
  MenuItem, IconButton, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, FormControl, InputLabel, Select
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import 'katex/dist/katex.min.css';
import MathText from '../../components/MathText';

export default function QuestionBank() {
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [qType, setQType] = useState('MCQ');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState<string[]>([]);
  const [qSubject, setQSubject] = useState('');
  const [qClass, setQClass] = useState('');
  const [qExplanation, setQExplanation] = useState('');

  const loadQuestions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'questions'), where('teacherId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, [user]);

  const handleAddQuestion = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'questions'), {
        teacherId: user.uid,
        type: qType,
        text: qText,
        options: qOptions.filter(o => o.trim() !== ''),
        correctAnswers: qCorrect,
        explanation: qExplanation,
        subject: qSubject,
        questionClass: Number(qClass),
        createdAt: serverTimestamp()
      });
      setOpen(false);
      loadQuestions();
      // Reset
      setQText(''); setQOptions(['', '', '', '']); setQCorrect([]); setQExplanation('');
    } catch (err) {
      console.error(err);
      alert('Failed to add question');
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>Question Bank</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Add Question
        </Button>
      </Box>

      {/* Render Questions */}
      <Grid container spacing={3}>
        {questions.map((q) => (
          <Grid key={q.id} size={{ xs: 12 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Chip label={q.type} size="small" sx={{ mb: 2 }} />
                  <Box sx={{ typography: 'body1', mb: 2 }}>
                    <MathText text={q.text} />
                  </Box>
                  {q.options && q.options.length > 0 && (
                    <Box pl={2}>
                      {q.options.map((opt: string, i: number) => (
                        <Box key={i} sx={{ typography: 'body2', color: q.correctAnswers.includes(opt) ? 'success.main' : 'text.secondary', fontWeight: q.correctAnswers.includes(opt) ? 'bold' : 'normal', display: 'flex', gap: 1 }}>
                          <span>{String.fromCharCode(65 + i)}.</span> <MathText text={opt} />
                        </Box>
                      ))}
                    </Box>
                  )}
                  {q.explanation && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1, typography: 'caption', color: 'text.secondary', display: 'block' }}>
                      <strong>Explanation:</strong> <MathText text={q.explanation} />
                    </Box>
                  )}
                </Box>
                <IconButton color="error" onClick={async () => {
                  if(confirm('Delete?')) {
                    await deleteDoc(doc(db, 'questions', q.id));
                    loadQuestions();
                  }
                }}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Question</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={qType} label="Type" onChange={(e) => setQType(e.target.value)}>
                <MenuItem value="MCQ">MCQ</MenuItem>
                <MenuItem value="MULTIPLE_CORRECT">Multiple Correct</MenuItem>
                <MenuItem value="TRUE_FALSE">True/False</MenuItem>
                <MenuItem value="SHORT_ANSWER">Short Answer</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              label="Question Text (Supports KaTeX, e.g. \int x^2 dx)" 
              multiline rows={3} fullWidth 
              value={qText} onChange={e => setQText(e.target.value)} 
            />

            {(qType === 'MCQ' || qType === 'MULTIPLE_CORRECT') && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Options</Typography>
                {qOptions.map((opt, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                    <TextField 
                      fullWidth size="small" label={`Option ${String.fromCharCode(65+i)}`} 
                      value={opt} onChange={e => {
                        const newOpts = [...qOptions];
                        newOpts[i] = e.target.value;
                        setQOptions(newOpts);
                      }} 
                    />
                    <Button 
                      variant={qCorrect.includes(opt) && opt !== '' ? 'contained' : 'outlined'} 
                      onClick={() => {
                        if (!opt) return;
                        if (qType === 'MCQ') setQCorrect([opt]);
                        else setQCorrect(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);
                      }}
                    >
                      Correct
                    </Button>
                  </Box>
                ))}
              </Box>
            )}

            <Box display="flex" gap={2}>
              <TextField label="Subject" value={qSubject} onChange={e => setQSubject(e.target.value)} fullWidth />
              <TextField label="Class" type="number" value={qClass} onChange={e => setQClass(e.target.value)} fullWidth />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddQuestion}>Save Question</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
