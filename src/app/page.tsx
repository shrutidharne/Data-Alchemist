'use client';
import React, { useState, useEffect } from 'react';
import UploadSection from '../components/UploadSection';
import DataTable from '../components/DataTable';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { GridColDef } from '@mui/x-data-grid';
import { validateClients, validateWorkers, validateTasks, ValidationError } from '../utils/validateData';
import WorkflowStepper from '../components/WorkflowStepper';
import Header from '../components/Header';
import Link from 'next/link';
import { useWorkflow } from '../components/WorkflowContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0a1019', paper: '#131a26' },
    primary: { main: '#2e9afe' },
    secondary: { main: '#fff' },
    text: { primary: '#fff', secondary: '#b0b8c1' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontWeight: 900, letterSpacing: 1 },
  },
});

const clientColumns: GridColDef[] = [
  { field: 'ClientID', headerName: 'Client ID', width: 120, editable: true },
  { field: 'ClientName', headerName: 'Client Name', width: 180, editable: true },
  { field: 'PriorityLevel', headerName: 'Priority Level', width: 120, editable: true, type: 'number',
    preProcessEditCellProps: (params) => {
      const value = params.props.value;
      const isValid = !isNaN(Number(value)) && value !== '';
      return { ...params.props, error: !isValid };
    }
  },
  { field: 'RequestedTaskIDs', headerName: 'Requested Task IDs', width: 200, editable: true },
  { field: 'GroupTag', headerName: 'Group Tag', width: 120, editable: true },
  { field: 'AttributesJSON', headerName: 'Attributes JSON', width: 250, editable: true,
    preProcessEditCellProps: (params) => {
      const value = params.props.value;
      let isValid = true;
      if (value && typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch {
          isValid = false;
        }
      }
      return { ...params.props, error: !isValid };
    }
  },
];

const workerColumns: GridColDef[] = [
  { field: 'WorkerID', headerName: 'Worker ID', width: 120, editable: true },
  { field: 'WorkerName', headerName: 'Worker Name', width: 180, editable: true },
  { field: 'Skills', headerName: 'Skills', width: 180, editable: true },
  { field: 'AvailableSlots', headerName: 'Available Slots', width: 140, editable: true },
  { field: 'MaxLoadPerPhase', headerName: 'Max Load/Phase', width: 140, editable: true, type: 'number' },
  { field: 'WorkerGroup', headerName: 'Worker Group', width: 120, editable: true },
  { field: 'QualificationLevel', headerName: 'Qualification Level', width: 160, editable: true },
];

const taskColumns: GridColDef[] = [
  { field: 'TaskID', headerName: 'Task ID', width: 120, editable: true },
  { field: 'TaskName', headerName: 'Task Name', width: 180, editable: true },
  { field: 'Category', headerName: 'Category', width: 120, editable: true },
  { field: 'Duration', headerName: 'Duration', width: 100, editable: true, type: 'number' },
  { field: 'RequiredSkills', headerName: 'Required Skills', width: 180, editable: true },
  { field: 'PreferredPhases', headerName: 'Preferred Phases', width: 160, editable: true },
  { field: 'MaxConcurrent', headerName: 'Max Concurrent', width: 140, editable: true, type: 'number' },
];

function exportToCSV(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename + '.csv', { bookType: 'csv' });
}

function exportToXLSX(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename + '.xlsx', { bookType: 'xlsx' });
}

function ClientsPage() {
  const { clients, setClients, workers, setWorkers, tasks, setTasks } = useWorkflow();
  const [tab, setTab] = useState(0);

  const [clientErrors, setClientErrors] = useState<ValidationError[]>([]);
  const [workerErrors, setWorkerErrors] = useState<ValidationError[]>([]);
  const [taskErrors, setTaskErrors] = useState<ValidationError[]>([]);

  // Wrapper functions with debugging
  const handleSetClients = (newClients: any[]) => {
    console.log('Setting clients:', newClients);
    setClients(newClients);
  };

  const handleSetWorkers = (newWorkers: any[]) => {
    console.log('Setting workers:', newWorkers);
    setWorkers(newWorkers);
  };

  const handleSetTasks = (newTasks: any[]) => {
    console.log('Setting tasks:', newTasks);
    setTasks(newTasks);
  };

  // Run validation on data change
  useEffect(() => {
    setClientErrors(validateClients(clients, tasks));
  }, [clients, tasks]);
  useEffect(() => {
    setWorkerErrors(validateWorkers(workers));
  }, [workers]);
  useEffect(() => {
    setTaskErrors(validateTasks(tasks));
  }, [tasks]);

  // Debug logs
  useEffect(() => {
    console.log('Tasks:', tasks);
    console.log('Task Errors:', taskErrors);
  }, [tasks, taskErrors]);

  // Debug logs for clients and workers
  useEffect(() => {
    console.log('Clients:', clients);
    console.log('Clients length:', clients.length);
  }, [clients]);

  useEffect(() => {
    console.log('Workers:', workers);
    console.log('Workers length:', workers.length);
  }, [workers]);

  // Comprehensive debug log
  useEffect(() => {
    console.log('=== DATA SUMMARY ===');
    console.log('Clients:', clients.length, 'items');
    console.log('Workers:', workers.length, 'items');
    console.log('Tasks:', tasks.length, 'items');
    console.log('===================');
  }, [clients, workers, tasks]);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Data Ingestion & Editing
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'background.paper', border: '1px solid #222' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered textColor="primary" indicatorColor="primary">
          <Tab label="Clients" />
          <Tab label="Workers" />
          <Tab label="Tasks" />
        </Tabs>
        {tab === 0 && <UploadSection setRows={handleSetClients} label="Clients" />}
        {tab === 1 && <UploadSection setRows={handleSetWorkers} label="Workers" />}
        {tab === 2 && <UploadSection setRows={handleSetTasks} label="Tasks" />}
      </Paper>
      <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid #222' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => {
              if (tab === 0) exportToCSV(clients, 'clients');
              if (tab === 1) exportToCSV(workers, 'workers');
              if (tab === 2) exportToCSV(tasks, 'tasks');
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => {
              if (tab === 0) exportToXLSX(clients, 'clients');
              if (tab === 1) exportToXLSX(workers, 'workers');
              if (tab === 2) exportToXLSX(tasks, 'tasks');
            }}
          >
            Export XLSX
          </Button>
        </Box>
        {tab === 0 && <DataTable rows={clients} setRows={handleSetClients} columns={clientColumns} validationErrors={clientErrors} />}
        {tab === 1 && <DataTable rows={workers} setRows={handleSetWorkers} columns={workerColumns} validationErrors={workerErrors} />}
        {tab === 2 && <DataTable rows={tasks} setRows={handleSetTasks} columns={taskColumns} validationErrors={taskErrors} />}
      </Paper>
    </Container>
  );
}

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <WorkflowStepper currentStep={0} />
      <ClientsPage />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, mb: 4, maxWidth: 900, mx: 'auto' }}>
        <Link href="/rules">
          <Button variant="contained" color="primary" size="large">Next</Button>
        </Link>
      </Box>
    </ThemeProvider>
  );
} 