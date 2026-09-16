import { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, 
  CircularProgress, Alert, Chip, Divider
} from '@mui/material';
import { AutoFixHigh, Add } from '@mui/icons-material';
import { useAuthStore } from '../../store/useAuthStore';
import { initializeGemini, generateWithFallback } from '../../lib/gemini';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import MathText from '../../components/MathText';

export default function AIAssistant() {
  const { user, userData } = useAuthStore();
  
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!userData?.geminiApiKey) {
      setError('Please configure your Gemini API Key in Settings first.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const genAI = initializeGemini(userData.geminiApiKey);
      
      const prompt = `Act as an expert examiner. Generate ${count} high-quality, thought-provoking multiple choice questions (MCQ) on the topic "${topic}" at a ${difficulty} difficulty level.
      CRITICAL INSTRUCTIONS FOR MATH/SCIENCE:
      - You MUST format all mathematical formulas, symbols, and equations using LaTeX wrapped in single dollar signs for inline math (e.g., $F = ma$) or double dollar signs for block math (e.g., $E = mc^2$). 
      - Treat the output as Markdown text. Do NOT use \text{} for normal text. Only wrap the actual math parts in $. Example: "A Carnot engine operates between $T_H = 500$ K and $T_C = 300$ K."
      - Ensure high-quality distractors (wrong options) that address common student misconceptions.
      - Keep explanations highly educational and concise.
      
      Format the response strictly as a JSON array of objects without markdown blockticks. Each object must have:
      - text: The question text
      - options: An array of 4 string options
      - correctAnswers: An array containing the exactly one correct option string
      - explanation: A detailed step-by-step reasoning
      
      Return ONLY a valid JSON array. No conversational text.`;
      
      const text = await generateWithFallback(genAI, prompt) || '';
      
      // Extract JSON array
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = text.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);
        setGeneratedQuestions(parsed);
      } else {
        setError('Failed to parse AI response. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating questions');
    }
    setLoading(false);
  };

  const handleSaveToBank = async (q: any) => {
    try {
      await addDoc(collection(db, 'questions'), {
        teacherId: user?.uid,
        type: 'MCQ',
        text: q.text,
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
        subject: userData?.subject || 'General',
        questionClass: 10, // default or prompt
        createdAt: serverTimestamp()
      });
      // Remove from list visually
      setGeneratedQuestions(prev => prev.filter(item => item.text !== q.text));
    } catch (err) {
      alert('Failed to save question');
    }
  };

  if (!userData?.geminiApiKey) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <AutoFixHigh sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>ExamHall AI Not Configured</Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          Please add your Gemini API Key in the Settings to enable ExamHall AI Question generation.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>ExamHall AI</Typography>
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField 
              fullWidth 
              label="Topic (e.g. Thermodynamics, Calculus, World War 2)" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField 
              fullWidth 
              type="number" 
              label="Count" 
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField 
              fullWidth 
              label="Difficulty" 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button 
              fullWidth 
              variant="contained" 
              size="large"
              disabled={loading || !topic}
              onClick={handleGenerate}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHigh />}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
      </Paper>

      {generatedQuestions.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Generated Questions</Typography>
          <Grid container spacing={2}>
            {generatedQuestions.map((q, idx) => (
              <Grid key={idx} size={{ xs: 12 }}>
                <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box>
                    <Box sx={{ typography: 'body1', fontWeight: "bold", mb: 1 }}>
                      <MathText text={q.text} />
                    </Box>
                    <Box pl={2} mb={1}>
                      {q.options.map((opt: string, i: number) => (
                        <Box key={i} sx={{ typography: 'body2', color: q.correctAnswers.includes(opt) ? 'success.main' : 'text.secondary', fontWeight: q.correctAnswers.includes(opt) ? 'bold' : 'normal', display: 'flex', gap: 1 }}>
                          <span>{String.fromCharCode(65 + i)}.</span> <MathText text={opt} />
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ typography: 'caption', color: "text.secondary", mt: 2, display: 'block' }}>
                      <strong>Explanation:</strong> <MathText text={q.explanation} />
                    </Box>
                  </Box>
                  <Box>
                    <Button variant="outlined" startIcon={<Add />} onClick={() => handleSaveToBank(q)}>
                      Save to Bank
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
