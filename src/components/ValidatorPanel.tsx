'use client';
import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  ExpandMore, 
  CheckCircle, 
  Error, 
  Warning, 
  Info,
  Download,
  AutoFixHigh,
  Refresh
} from '@mui/icons-material';
import { ValidationError } from '../utils/validateData';

interface ValidatorPanelProps {
  errors: ValidationError[];
  onFixErrors?: (errors: ValidationError[]) => void;
  onExportReport?: () => void;
}

export default function ValidatorPanel({ errors, onFixErrors, onExportReport }: ValidatorPanelProps) {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getErrorSeverity = (error: ValidationError) => {
    if (error.message.includes('Critical') || error.message.includes('Duplicate')) return 'error';
    if (error.message.includes('Warning') || error.message.includes('Invalid')) return 'warning';
    return 'info';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <Error sx={{ color: '#f56565' }} />;
      case 'warning': return <Warning sx={{ color: '#ed8936' }} />;
      default: return <Info sx={{ color: '#4299e1' }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return '#f56565';
      case 'warning': return '#ed8936';
      default: return '#4299e1';
    }
  };

  const autoFixableErrors = errors.filter(error => 
    error.message.includes('PriorityLevel must be 1-5') ||
    error.message.includes('Duration must be >= 1') ||
    error.message.includes('MaxConcurrent must be >= 1')
  );

  const criticalErrors = errors.filter(error => 
    error.message.includes('Duplicate') ||
    error.message.includes('Unknown TaskID') ||
    error.message.includes('No worker covers skill')
  );

  const warningErrors = errors.filter(error => 
    error.message.includes('Invalid PreferredPhases') ||
    error.message.includes('Malformed JSON')
  );

  return (
    <Paper elevation={2} sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid #2d3748' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
          Advanced Validation
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {autoFixableErrors.length > 0 && (
            <Button
              size="small"
              startIcon={<AutoFixHigh />}
              onClick={() => onFixErrors?.(autoFixableErrors)}
              sx={{
                bgcolor: '#4299e1',
                color: '#fff',
                '&:hover': { bgcolor: '#3182ce' }
              }}
            >
              Auto-Fix ({autoFixableErrors.length})
            </Button>
          )}
          <Button
            size="small"
            startIcon={<Download />}
            onClick={onExportReport}
            sx={{
              bgcolor: '#2d3748',
              color: '#e2e8f0',
              border: '1px solid #4a5568',
              '&:hover': { bgcolor: '#4a5568' }
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Error Summary */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {criticalErrors.length > 0 && (
          <Chip
            icon={<Error />}
            label={`${criticalErrors.length} Critical`}
            sx={{ bgcolor: '#f56565', color: '#fff' }}
          />
        )}
        {warningErrors.length > 0 && (
          <Chip
            icon={<Warning />}
            label={`${warningErrors.length} Warnings`}
            sx={{ bgcolor: '#ed8936', color: '#fff' }}
          />
        )}
        {autoFixableErrors.length > 0 && (
          <Chip
            icon={<AutoFixHigh />}
            label={`${autoFixableErrors.length} Auto-fixable`}
            sx={{ bgcolor: '#4299e1', color: '#fff' }}
          />
        )}
      </Box>

      {/* Error Categories */}
      <Accordion 
        expanded={expanded === 'critical'} 
        onChange={handleChange('critical')}
        sx={{ bgcolor: '#1a202c', border: '1px solid #2d3748' }}
      >
        <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#e2e8f0' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Error sx={{ color: '#f56565' }} />
            <Typography sx={{ color: '#e2e8f0', fontWeight: 600 }}>
              Critical Issues ({criticalErrors.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {criticalErrors.map((error, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  {getSeverityIcon(getErrorSeverity(error))}
                </ListItemIcon>
                <ListItemText
                  primary={`${error.rowId}: ${error.message}`}
                  secondary={error.column ? `Column: ${error.column}` : ''}
                  sx={{
                    '& .MuiListItemText-primary': { color: '#e2e8f0', fontSize: '0.875rem' },
                    '& .MuiListItemText-secondary': { color: '#a0aec0', fontSize: '0.75rem' }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expanded === 'warnings'} 
        onChange={handleChange('warnings')}
        sx={{ bgcolor: '#1a202c', border: '1px solid #2d3748' }}
      >
        <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#e2e8f0' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: '#ed8936' }} />
            <Typography sx={{ color: '#e2e8f0', fontWeight: 600 }}>
              Warnings ({warningErrors.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {warningErrors.map((error, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  {getSeverityIcon(getErrorSeverity(error))}
                </ListItemIcon>
                <ListItemText
                  primary={`${error.rowId}: ${error.message}`}
                  secondary={error.column ? `Column: ${error.column}` : ''}
                  sx={{
                    '& .MuiListItemText-primary': { color: '#e2e8f0', fontSize: '0.875rem' },
                    '& .MuiListItemText-secondary': { color: '#a0aec0', fontSize: '0.75rem' }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Validation Tips */}
      <Alert severity="info" sx={{ mt: 2, bgcolor: '#1a202c', border: '1px solid #2d3748' }}>
        <AlertTitle sx={{ color: '#e2e8f0' }}>Validation Tips</AlertTitle>
        <Typography variant="body2" sx={{ color: '#a0aec0' }}>
          • Critical errors must be fixed before proceeding<br/>
          • Use Auto-Fix for common validation issues<br/>
          • Export validation reports for compliance tracking<br/>
          • Check cross-references between Clients, Workers, and Tasks
        </Typography>
      </Alert>
    </Paper>
  );
}
