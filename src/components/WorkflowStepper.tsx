import React from 'react';
import { Box, Typography } from '@mui/material';

const steps = [
  'Data Management',
  'Rules Builder',
  'Prioritization',
  'Preview & Export',
];

export default function WorkflowStepper({ currentStep }: { currentStep: number }) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 2,
      mb: 3,
      background: 'transparent',
    }}>
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 120,
          }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: idx === currentStep ? '#23293a' : '#e0e0e0',
              border: idx === currentStep ? '2px solid #1976d2' : '1px solid #bdbdbd',
              color: idx === currentStep ? '#1976d2' : '#757575',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 18,
              mb: 0.5,
              transition: 'all 0.2s',
            }}>
              {idx + 1}
            </Box>
            <Typography sx={{
              fontSize: 14,
              color: idx === currentStep ? '#1976d2' : '#757575',
              fontWeight: idx === currentStep ? 700 : 400,
              textAlign: 'center',
              maxWidth: 110,
            }}>
              {label}
            </Typography>
          </Box>
          {idx < steps.length - 1 && (
            <Box sx={{
              flex: 1,
              height: 2,
              background: '#bdbdbd',
              mx: 1.5,
              minWidth: 32,
              borderRadius: 1,
            }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
} 