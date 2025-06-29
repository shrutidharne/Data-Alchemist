"use client";
import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import WorkflowStepper from '../../components/WorkflowStepper';
import Link from 'next/link';
import { useWorkflow } from '../../components/WorkflowContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function PreviewPage() {
  const { clients, workers, tasks, weights, rules } = useWorkflow();
  const [exported, setExported] = useState(false);

  // Export all as JSON
  const handleExportAll = () => {
    const json = JSON.stringify({
      clients,
      workers,
      tasks,
      rules,
      prioritization: weights
    }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-alchemist-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  if (exported) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 10, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#1976d2', mb: 2 }}>
          Thank You!
        </Typography>
        <Typography variant="h6" sx={{ color: '#b0b8c1', mb: 4 }}>
          Your configuration has been exported successfully.<br />
          You can now return to the home page to start a new workflow.
        </Typography>
        <Link href="/">
          <Button variant="contained" color="primary" size="large">
            Back to Home
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <WorkflowStepper currentStep={3} />
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Uploaded Data</Typography>
        <pre style={{ background: '#181f2a', color: '#b0b8c1', padding: 12, borderRadius: 8, fontSize: 14 }}>
          {JSON.stringify({ clients, workers, tasks }, null, 2)}
        </pre>
      </Paper>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Prioritization Settings</Typography>
        <pre style={{ background: '#181f2a', color: '#b0b8c1', padding: 12, borderRadius: 8, fontSize: 14 }}>
          {JSON.stringify(weights, null, 2)}
        </pre>
      </Paper>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Business Rules</Typography>
        <pre style={{ background: '#181f2a', color: '#b0b8c1', padding: 12, borderRadius: 8, fontSize: 14 }}>
          {JSON.stringify(rules, null, 2)}
        </pre>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Link href="/priority">
          <Button variant="outlined" color="primary" size="large">Back</Button>
        </Link>
        <Button variant="contained" color="success" size="large" onClick={handleExportAll}>
          Export All
        </Button>
      </Box>
    </Box>
  );
} 