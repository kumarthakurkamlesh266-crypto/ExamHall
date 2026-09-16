const fs = require('fs');
let content = fs.readFileSync('src/pages/Student/Tests.tsx', 'utf8');

const targetImports = `import { Box, Typography, Paper, Grid, Button, Chip } from '@mui/material';`;
const replaceImports = `import { Box, Typography, Paper, Grid, Button, Chip, Skeleton } from '@mui/material';`;
content = content.replace(targetImports, replaceImports);

const targetState = `  const [tests, setTests] = useState<any[]>([]);`;
const replaceState = `  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);`;
content = content.replace(targetState, replaceState);

const targetSetTests = `      setTests(data);
    };
    fetchTests();
  }, [userData]);`;
const replaceSetTests = `      setTests(data);
      setLoading(false);
    };
    fetchTests();
  }, [userData]);`;
content = content.replace(targetSetTests, replaceSetTests);

const targetMap = `        {tests.map(test => {`;
const replaceMap = `        {loading && (
          <>
            {[1, 2, 3].map((n) => (
              <Grid key={n} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="text" width={40} />
                  </Box>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
                  <Box mb={3} flexGrow={1}>
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
                  </Box>
                  <Skeleton variant="rounded" width="100%" height={36} />
                </Paper>
              </Grid>
            ))}
          </>
        )}
        {!loading && tests.map(test => {`;
content = content.replace(targetMap, replaceMap);

const targetEmpty = `        {tests.length === 0 && (`;
const replaceEmpty = `        {!loading && tests.length === 0 && (`;
content = content.replace(targetEmpty, replaceEmpty);

fs.writeFileSync('src/pages/Student/Tests.tsx', content);
