"use client";
import React, { useState } from 'react';
import PrioritySliders from '../../components/PrioritySliders';
import { Box, Button, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Link from 'next/link';
import { useWorkflow } from '../../components/WorkflowContext';
import WorkflowStepper from '../../components/WorkflowStepper';

const presetProfiles = {
  maximizeFulfillment: { priorityLevel: 40, taskFulfillment: 50, fairness: 10 },
  fairDistribution: { priorityLevel: 30, taskFulfillment: 30, fairness: 40 },
  minimizeWorkload: { priorityLevel: 20, taskFulfillment: 30, fairness: 50 },
};

export default function PriorityPage() {
  const { weights, setWeights, rules } = useWorkflow();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const total = Object.values(weights).reduce((a, b) => a + Number(b), 0);
  const sumTo100 = total === 100;

  const applyPreset = (preset: keyof typeof presetProfiles) => {
    if (presetProfiles[preset]) {
      setWeights(presetProfiles[preset]);
      setSelectedPreset(preset);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreviewOpen(true);
  };

  // Download full config (rules + prioritization)
  const handleDownloadFullConfig = () => {
    const json = JSON.stringify({
      rules,
      prioritization: weights
    }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'full-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <WorkflowStepper currentStep={2} />
      {/* <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
        Step 2: Prioritization & Preset Profiles
      </Typography> */}
      <PrioritySliders weights={weights} setWeights={setWeights} applyPreset={applyPreset} selectedPreset={selectedPreset || undefined} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleDownloadFullConfig}
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          Download Full Config
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Link href="/rules">
          <Button variant="outlined" color="primary" size="large">Back</Button>
        </Link>
        {/* Show preview dialog before navigating to next step */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={!sumTo100}
          onClick={handleNext}
        >
          Next
        </Button>
      </Box>
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <DialogTitle>Preview: Applied Weights</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The following weights will be applied:
          </Typography>
          <Box sx={{ bgcolor: '#23293a', p: 2, borderRadius: 2, fontFamily: 'monospace', fontSize: 15 }}>
            {JSON.stringify(weights, null, 2)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} color="secondary">Cancel</Button>
          <Link href="/preview">
            <Button color="primary" variant="contained" onClick={() => setPreviewOpen(false)} autoFocus>
              Confirm & Next
            </Button>
          </Link>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 