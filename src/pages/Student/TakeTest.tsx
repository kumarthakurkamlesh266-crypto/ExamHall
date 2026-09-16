import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Button, Radio, RadioGroup, 
  FormControlLabel, FormControl, Divider, CircularProgress
} from '@mui/material';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import MathText from '../../components/MathText';

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuthStore();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      try {
        const testDoc = await getDoc(doc(db, 'tests', testId));
        if (testDoc.exists()) {
          const testData = testDoc.data();
          setTest(testData);
          setTimeLeft(testData.duration * 60);

          // Fetch Questions
          const qPromises = testData.questions.map((qId: string) => getDoc(doc(db, 'questions', qId)));
          const qDocs = await Promise.all(qPromises);
          setQuestions(qDocs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (timeLeft <= 0 && test) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, test]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      // Calculate score
      let score = 0;
      questions.forEach(q => {
        if (q.type === 'MCQ' && answers[q.id] === q.correctAnswers[0]) {
          score += (test.totalMarks / questions.length);
        }
      });
      
      const percentage = (score / test.totalMarks) * 100;

      await addDoc(collection(db, 'results'), {
        testId,
        testName: test.name,
        studentId: user?.uid,
        studentName: userData.name,
        studentRoll: userData.rollNumber,
        teacherId: test.teacherId,
        score,
        percentage,
        answers,
        submittedAt: serverTimestamp()
      });

      alert(`Test Submitted! You scored ${score.toFixed(2)} / ${test.totalMarks}`);
      navigate('/student/history');
    } catch (err) {
      console.error(err);
      alert('Error submitting test');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <Box p={4} sx={{ display: "flex", justifyContent: "center" }}><CircularProgress /></Box>;
  if (!test) return <Box p={4}><Typography>Test not found.</Typography></Box>;

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3, position: 'sticky', top: 64, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>{test.name}</Typography>
        <Typography variant="h6" sx={{ color: timeLeft < 60 ? 'error' : 'primary' }}>
          Time Left: {formatTime(timeLeft)}
        </Typography>
      </Paper>

      {questions.map((q, idx) => (
        <Paper key={q.id} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ typography: 'body1', fontWeight: "bold", mb: 2, display: 'flex', gap: 1 }}>
            <span>{idx + 1}.</span> <MathText text={q.text} />
          </Box>
          
          {q.type === 'MCQ' && (
            <FormControl component="fieldset">
              <RadioGroup
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              >
                {q.options.map((opt: string, i: number) => (
                  <FormControlLabel 
                    key={i} 
                    value={opt} 
                    control={<Radio />} 
                    label={<MathText text={opt} />} 
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </Paper>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => {
            if (confirm("Are you sure you want to submit?")) {
              handleSubmit();
            }
          }}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Test'}
        </Button>
      </Box>
    </Box>
  );
}
