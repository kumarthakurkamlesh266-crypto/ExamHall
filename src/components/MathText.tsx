import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Box } from '@mui/material';

export default function MathText({ text }: { text: string }) {
  return (
    <Box 
      sx={{ 
        '& p': { m: 0, p: 0 }, 
        display: 'inline-block',
        width: '100%',
        wordBreak: 'break-word',
        '& .katex': {
           fontSize: '1.05em'
        }
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
}
