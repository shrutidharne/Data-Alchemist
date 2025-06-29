'use client';
import * as React from 'react';
import { DataGrid, GridColDef, GridRowModel, GridToolbar, GridOverlay, GridCellParams } from '@mui/x-data-grid';
import { ValidationError } from '../utils/validateData';
import { Box, Paper, Typography, Chip, Alert, AlertTitle, Collapse } from '@mui/material';
import { Warning, Error, Info } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';

interface DataTableProps {
  rows: any[];
  setRows: (rows: any[]) => void;
  columns: GridColDef[];
  validationErrors?: ValidationError[];
}

function CustomNoRowsOverlay() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#b0b8c1',
      fontSize: 18,
      fontWeight: 500,
      opacity: 0.8,
    }}>
      Upload a file to view data
    </div>
  );
}

function ErrorPanel({ errors }: { errors: ValidationError[] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (errors.length === 0) return null;

  const errorCount = errors.length;

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mb: 2, 
        p: 2, 
        bgcolor: 'background.paper',
        border: '1px solid #2d3748',
        borderRadius: 2
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
          p: 1,
          borderRadius: 1
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Error sx={{ color: '#f56565', fontSize: 20 }} />
          <Typography variant="h6" sx={{ color: '#f56565', fontWeight: 600 }}>
            Data Validation Issues ({errorCount})
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#a0aec0' }}>
          {isExpanded ? '▼' : '▶'}
        </Typography>
      </Box>
      
      <Collapse in={isExpanded}>
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #2d3748' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {errors.map((error, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 1.5,
                  bgcolor: '#1a202c',
                  border: '1px solid #2d3748',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Error sx={{ color: '#f56565', fontSize: 16, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 500 }}>
                    Row: {error.rowId}
                  </Typography>
                  {error.column && (
                    <Typography variant="body2" sx={{ color: '#a0aec0', fontSize: '0.875rem' }}>
                      Column: {error.column}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: '#e2e8f0', mt: 0.5 }}>
                    {error.message}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}

export default function DataTable({ rows, setRows, columns, validationErrors = [] }: DataTableProps) {
  const [expandedEntities, setExpandedEntities] = React.useState<Record<string, boolean>>({});
  const [editTooltipCell, setEditTooltipCell] = React.useState<{ field: string; id: any } | null>(null);
  
  const handleRowEdit = (newRow: GridRowModel) => {
    const updatedRows = rows.map((row, idx) => {
      const rowId = (row.ClientID || row.WorkerID || row.TaskID) + '-' + idx;
      if (rowId === newRow.id) {
        return { ...row, ...newRow };
      }
      return row;
    });
    setRows(updatedRows);
    return { ...newRow };
  };

  // Ensure each row has a unique and stable id, even for duplicates
  const rowsWithId = rows.map((row, idx) => ({
    id: (row.ClientID || row.WorkerID || row.TaskID) + '-' + idx,
    ...row,
  }));

  // Map errors for quick lookup and tooltip content
  const errorMap = React.useMemo(() => {
    const map: Record<string, Record<string, { hasError: boolean; message: string }>> = {};
    validationErrors.forEach(err => {
      if (!map[err.rowId]) map[err.rowId] = {};
      if (err.column) {
        map[err.rowId][err.column] = { 
          hasError: true, 
          message: err.message 
        };
      }
    });
    return map;
  }, [validationErrors]);

  // Get error count for status indicator
  const errorCount = validationErrors.length;
  const getStatusColor = () => {
    if (errorCount === 0) return '#48bb78'; // Green
    if (errorCount <= 5) return '#4299e1';  // Blue
    if (errorCount <= 10) return '#ed8936'; // Orange
    return '#f56565';                       // Red
  };

  const getStatusText = () => {
    if (errorCount === 0) return 'Valid';
    if (errorCount <= 5) return 'Minor Issues';
    if (errorCount <= 10) return 'Warnings';
    return 'Critical Issues';
  };

  return (
    <Box>
      {/* Status Indicator */}
      {rows.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 2,
          p: 1,
          bgcolor: 'background.paper',
          border: '1px solid #2d3748',
          borderRadius: 1,
          width: 'fit-content'
        }}>
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: getStatusColor()
          }} />
          <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 500 }}>
            Data Status: {getStatusText()} ({errorCount} issues)
          </Typography>
        </Box>
      )}
      
      <ErrorPanel errors={validationErrors} />
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rowsWithId}
          columns={columns.map(col => ({
            ...col,
            renderCell: (params: GridCellParams) => {
              const rowId = params.row.ClientID || params.row.WorkerID || params.row.TaskID;
              const hasError = errorMap[rowId] && errorMap[rowId][params.field]?.hasError;
              const value = params.value ?? '';
              if (hasError) {
                return (
                  <Tooltip
                    title="Press here to edit"
                    arrow
                    placement="top"
                    enterDelay={100}
                  >
                    <span style={{ display: 'block', width: '100%', minHeight: 24, cursor: 'pointer' }}>
                      {String(value)}
                    </span>
                  </Tooltip>
                );
              }
              return <span style={{ display: 'block', width: '100%', minHeight: 24 }}>{String(value)}</span>;
            }
          }))}
          processRowUpdate={handleRowEdit}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar, noRowsOverlay: CustomNoRowsOverlay }}
          getCellClassName={(params) => {
            // Use the original TaskID/ClientID/WorkerID for error mapping
            const rowId = params.row.ClientID || params.row.WorkerID || params.row.TaskID;
            if (errorMap[rowId] && errorMap[rowId][params.field]?.hasError) {
              return 'cell-error';
            }
            return '';
          }}
          onCellClick={(params) => {
            if (params.colDef.editable) {
              setEditTooltipCell({ field: params.field, id: params.id });
            } else {
              setEditTooltipCell(null);
            }
          }}
          sx={{
            '& .cell-error': {
              bgcolor: 'rgba(245, 101, 101, 0.08)',
              border: '1px solid rgba(245, 101, 101, 0.2)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 2,
                right: 2,
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: '#f56565',
                boxShadow: '0 0 0 1px rgba(245, 101, 101, 0.3)',
              }
            },
            '& .cell-error:hover': {
              bgcolor: 'rgba(245, 101, 101, 0.12)',
              border: '1px solid rgba(245, 101, 101, 0.4)',
            },
            '& .MuiDataGrid-cell': {
              cursor: 'default',
            }
          }}
        />
      </div>
    </Box>
  );
}
