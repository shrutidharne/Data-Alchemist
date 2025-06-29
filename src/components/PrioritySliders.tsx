import React from 'react';
import { Slider, Box, Typography, Button, Stack, Paper } from '@mui/material';

const ACCENT = '#1976d2'; // Official strong blue
const criteria = [
  { key: 'priorityLevel', label: 'Priority Level' },
  { key: 'taskFulfillment', label: 'Requested TaskIDs Fulfillment' },
  { key: 'fairness', label: 'Fairness' },
];

interface PrioritySlidersProps {
  weights: Record<string, number>;
  setWeights: (w: Record<string, number>) => void;
  applyPreset: (preset: 'maximizeFulfillment' | 'fairDistribution' | 'minimizeWorkload') => void;
  selectedPreset?: string;
}

export default function PrioritySliders({ weights, setWeights, applyPreset, selectedPreset }: PrioritySlidersProps) {
  // Calculate total as percent (sum of all weights, normalized to 100)
  const total = Object.values(weights).reduce((a, b) => a + Number(b), 0);
  const percentWeights = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, total ? Math.round((Number(v) / total) * 100) : 0])
  );

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 5, bgcolor: '#181f2a', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: ACCENT, letterSpacing: 1 }}>
        Prioritization & Weights
      </Typography>
      {criteria.map(c => (
        <Box key={c.key} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#fff' }}>
              {c.label}
            </Typography>
            <Typography variant="h6" sx={{ color: ACCENT, fontWeight: 900, minWidth: 70, textAlign: 'right' }}>
              {weights[c.key]} <span style={{ fontSize: 15, color: '#90caf9', fontWeight: 700 }}>({percentWeights[c.key]}%)</span>
            </Typography>
          </Box>
          <Slider
            aria-label={c.label}
            value={weights[c.key]}
            min={0}
            max={100}
            step={1}
            marks={[{ value: 0, label: '0' }, { value: 100, label: '100' }]}
            valueLabelDisplay="auto"
            onChange={(_, v) => setWeights({ ...weights, [c.key]: v as number })}
            sx={{
              color: ACCENT,
              height: 8,
              '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
                bgcolor: '#fff',
                border: `3px solid ${ACCENT}`,
                boxShadow: '0 2px 8px rgba(25,118,210,0.15)',
              },
              '& .MuiSlider-rail': {
                opacity: 0.5,
                bgcolor: ACCENT,
              },
              '& .MuiSlider-markLabel': {
                color: '#90caf9',
                fontWeight: 600,
              },
            }}
          />
        </Box>
      ))}
      <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
        <Button
          variant={selectedPreset === 'maximizeFulfillment' ? 'contained' : 'outlined'}
          color="primary"
          size="large"
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            minWidth: 180,
            boxShadow: selectedPreset === 'maximizeFulfillment' ? 2 : 0,
            bgcolor: selectedPreset === 'maximizeFulfillment' ? '#1976d2' : 'transparent',
            color: selectedPreset === 'maximizeFulfillment' ? '#fff' : undefined,
            borderColor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0',
              color: '#fff',
              borderColor: '#1976d2',
            },
          }}
          onClick={() => applyPreset('maximizeFulfillment')}
        >
          Maximize Fulfillment
        </Button>
        <Button
          variant={selectedPreset === 'fairDistribution' ? 'contained' : 'outlined'}
          color="primary"
          size="large"
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            minWidth: 180,
            boxShadow: selectedPreset === 'fairDistribution' ? 2 : 0,
            bgcolor: selectedPreset === 'fairDistribution' ? '#7b2ff2' : 'transparent',
            color: selectedPreset === 'fairDistribution' ? '#fff' : undefined,
            borderColor: '#7b2ff2',
            '&:hover': {
              bgcolor: '#5f23b2',
              color: '#fff',
              borderColor: '#7b2ff2',
            },
          }}
          onClick={() => applyPreset('fairDistribution')}
        >
          Fair Distribution
        </Button>
        <Button
          variant={selectedPreset === 'minimizeWorkload' ? 'contained' : 'outlined'}
          color="primary"
          size="large"
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            minWidth: 180,
            boxShadow: selectedPreset === 'minimizeWorkload' ? 2 : 0,
            bgcolor: selectedPreset === 'minimizeWorkload' ? '#414345' : 'transparent',
            color: selectedPreset === 'minimizeWorkload' ? '#fff' : undefined,
            borderColor: '#414345',
            '&:hover': {
              bgcolor: '#232526',
              color: '#fff',
              borderColor: '#414345',
            },
          }}
          onClick={() => applyPreset('minimizeWorkload')}
        >
          Minimize Workload
        </Button>
      </Stack>
    </Paper>
  );
}
